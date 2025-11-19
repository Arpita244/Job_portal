// controllers/roleSuggestionController.js
const axios = require("axios");

// simple local fallback generator in case AI fails
function localSuggestions(profile) {
  const skills = (profile.skills || []).map(s => s.toLowerCase());
  const suggestions = [];

  if (skills.includes("cook") || skills.includes("cooking")) {
    suggestions.push({
      title: "Kitchen Assistant",
      why_match: "Good starting role for cooking skills.",
      score: 60,
      apply_links: [{ site: "Naukri", url: "https://www.naukri.com/" }]
    });
    suggestions.push({
      title: "Line Cook",
      why_match: "Works a specific station in kitchens.",
      score: 55,
      apply_links: [{ site: "Indeed", url: "https://in.indeed.com/" }]
    });
  }

  if (skills.includes("code") || skills.includes("coding") || skills.includes("programming")) {
    suggestions.push({
      title: "Web Developer (Intern)",
      why_match: "Entry-level coding tasks (HTML/CSS/JS).",
      score: 75,
      apply_links: [{ site: "LinkedIn", url: "https://www.linkedin.com/jobs/" }]
    });
    suggestions.push({
      title: "Junior Frontend Developer",
      why_match: "React/JS based frontend role.",
      score: 70,
      apply_links: [{ site: "Naukri", url: "https://www.naukri.com/" }]
    });
  }

  if (skills.includes("electric") || skills.includes("wiring")) {
    suggestions.push({
      title: "Apprentice Electrician",
      why_match: "On-the-job learning for wiring and tools.",
      score: 65,
      apply_links: [{ site: "Local Listings", url: "https://www.google.com/search?q=apprentice+electrician+near+me" }]
    });
  }

  // default fallback
  if (!suggestions.length) {
    suggestions.push({
      title: "Entry-level / Assistant",
      why_match: "General entry-level opportunities related to your skills.",
      score: 40,
      apply_links: [{ site: "Indeed", url: "https://in.indeed.com/" }]
    });
  }

  return suggestions;
}

// Extract first JSON object/array substring from text (if model emits extra commentary)
function extractJsonFromText(text) {
  if (!text || typeof text !== "string") return null;
  // find first '[' or '{'
  const firstBracket = text.indexOf("[");
  const firstBrace = text.indexOf("{");
  let start = -1;
  if (firstBracket !== -1 && (firstBracket < firstBrace || firstBrace === -1)) start = firstBracket;
  else if (firstBrace !== -1) start = firstBrace;
  if (start === -1) return null;

  // try to find matching closing bracket/braces using simple stack parse
  const stack = [];
  let end = -1;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (ch === "{" || ch === "[") stack.push(ch);
    else if (ch === "}" || ch === "]") {
      const last = stack[stack.length - 1];
      if ((ch === "}" && last === "{") || (ch === "]" && last === "[")) {
        stack.pop();
        if (stack.length === 0) {
          end = i + 1; // include this char
          break;
        }
      } else {
        // mismatched — abort
        break;
      }
    }
  }
  if (end === -1) return null;
  const jsonStr = text.slice(start, end);
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    return null;
  }
}

exports.getAISuggestions = async (req, res) => {
  try {
    console.log("📩 Received profile:", JSON.stringify(req.body));
    const profile = req.body;
    if (!profile || typeof profile !== "object") {
      return res.status(400).json({ success: false, error: "Profile missing or invalid" });
    }

    // Accept both env names: GEMINI_KEY or GEMINI_API_KEY
    const GEMINI_KEY = process.env.GEMINI_KEY || process.env.GEMINI_API_KEY || process.env.GEMINI_APIKEY;
    if (!GEMINI_KEY) {
      console.warn("⚠️ Gemini API key not set (GEMINI_KEY / GEMINI_API_KEY). Falling back to local suggestions.");
      const fallback = localSuggestions(profile);
      return res.json({ success: true, suggestions: fallback, from: "fallback_no_key" });
    }

    // Build a clear, constrained prompt that asks for strict JSON array only
    const prompt = `
You are a job-matching assistant. Given the user's profile below, return a JSON array (ONLY the array) of up to 8 job suggestions.
Each item must be an object with keys: "title" (string), "why_match" (string), "score" (integer 0-100), "apply_links" (array of { "site": "", "url": "" }).

User profile:
Skills: ${Array.isArray(profile.skills) ? profile.skills.join(", ") : profile.skills || ""}
Interests: ${Array.isArray(profile.interests) ? profile.interests.join(", ") : profile.interests || ""}
Location: ${profile.location || ""}
Salary Preference: ${profile.salaryPreference || ""}

Do NOT output anything except a single JSON array.
`;

    console.log("📤 Sending request to Gemini endpoint...");

    // Post to Generative Language API. Use short timeout and one retry on network error.
    let aiResponse;
    try {
      aiResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_KEY}`,
        {
          // provider expects contents -> parts -> text (as in previous examples)
          contents: [{ parts: [{ text: prompt }] }],
        },
        { timeout: 20000 } // 20s
      );
    } catch (err) {
      console.warn("⚠️ First Gemini call failed:", err.message);
      // retry once for transient network issues (not for 4xx)
      if (err.code === "ECONNABORTED" || err.code === "ENOTFOUND" || err.code === "ETIMEDOUT" || err.response?.status >= 500) {
        try {
          console.log("🔁 Retrying Gemini call once...");
          aiResponse = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_KEY}`,
            { contents: [{ parts: [{ text: prompt }] }] },
            { timeout: 20000 }
          );
        } catch (err2) {
          console.error("❌ Gemini retry failed:", err2.message);
          const fallback = localSuggestions(profile);
          return res.status(200).json({ success: true, suggestions: fallback, from: "fallback_after_error", error: err2.message });
        }
      } else {
        console.error("❌ Gemini call failed (no retry):", err.message, "resp:", err.response?.data);
        const fallback = localSuggestions(profile);
        return res.status(200).json({ success: true, suggestions: fallback, from: "fallback_after_error", error: err.message });
      }
    }

    console.log("📥 Gemini raw response:", aiResponse.data);

    // The provider may put content in different fields. Try several common shapes:
    let rawText = null;
    try {
      rawText = aiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text
        || aiResponse.data?.candidates?.[0]?.content?.[0]?.text
        || aiResponse.data?.candidates?.[0]?.content
        || aiResponse.data?.output
        || aiResponse.data?.choices?.[0]?.message?.content?.[0]?.text
        || aiResponse.data?.choices?.[0]?.text
        || (typeof aiResponse.data === "string" ? aiResponse.data : null);
    } catch (e) {
      rawText = null;
    }

    if (!rawText) {
      console.warn("⚠️ Could not find AI text in response, returning fallback. Full response logged above.");
      const fallback = localSuggestions(profile);
      return res.json({ success: true, suggestions: fallback, from: "fallback_no_ai_text", aiRaw: aiResponse.data });
    }

    // If the model returned an array already (object), use it
    if (Array.isArray(rawText)) {
      return res.json({ success: true, suggestions: rawText, from: "ai_array" });
    }

    // If it's an object string or plain string containing JSON, attempt to parse directly
    let parsed = null;
    if (typeof rawText === "object") {
      parsed = rawText;
    } else {
      // try direct parse
      try {
        parsed = JSON.parse(rawText);
      } catch (e) {
        // try to extract JSON substring
        parsed = extractJsonFromText(String(rawText));
      }
    }

    if (!parsed) {
      console.warn("⚠️ Could not parse JSON from AI output. Returning fallback and attaching aiRaw for debugging.");
      const fallback = localSuggestions(profile);
      return res.status(200).json({ success: true, suggestions: fallback, from: "fallback_parse_failed", aiRaw: rawText });
    }

    // ensure parsed is an array
    if (!Array.isArray(parsed)) {
      // If AI sent object with a top-level property 'suggestions' or similar, attempt to normalize
      if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
        parsed = parsed.suggestions;
      } else {
        // wrap single object into array
        parsed = [parsed];
      }
    }

    // final sanitization: ensure expected keys exist and types are correct
    const sanitized = parsed.map((it) => {
      return {
        title: String(it.title || it.job || it.role || "Untitled"),
        why_match: String(it.why_match || it.reason || it.description || ""),
        score: Number.isFinite(it.score) ? Math.max(0, Math.min(100, Math.round(it.score))) : 50,
        apply_links: Array.isArray(it.apply_links) ? it.apply_links.map(l => ({ site: l.site || l.name || "link", url: l.url || l.link || l.href || "#" })) : []
      };
    });

    return res.json({ success: true, suggestions: sanitized, from: "ai", aiRaw: rawText });
  } catch (err) {
    console.error("❌ SERVER ERROR in getAISuggestions:", err);
    // On unexpected server error return fallback suggestions so front-end doesn't show 'AI failed'
    const fallback = localSuggestions(req.body || {});
    return res.status(500).json({ success: true, suggestions: fallback, from: "fallback_exception", error: String(err) });
  }
};
