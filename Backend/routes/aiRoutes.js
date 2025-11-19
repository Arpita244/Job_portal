const express = require("express");
const axios = require("axios");
const Role = require("../models/Role");

const router = express.Router();

// Helper: simple fallback generator
function fallbackMatchRoles(profile) {
  // naive scoring: count skill matches with roles in DB (will fetch)
  // We'll return an array of objects { role, score, reason }
  return Role.find({}).then(roles => {
    const profileSkills = (profile.skills || []).map(s => s.toLowerCase());
    return roles.map(r => {
      const roleSkills = (r.skills_required || []).map(s => s.toLowerCase());
      const matches = roleSkills.filter(s => profileSkills.includes(s)).length;
      const score = Math.min(100, matches * 30 + (profile.interests && profile.interests.length ? 10 : 0));
      return {
        role: r.role,
        description: r.description,
        score,
        skills_required: r.skills_required
      };
    }).sort((a,b)=>b.score-a.score);
  });
}

// POST /api/ai/match - expects profile in body
router.post("/match", async (req, res) => {
  try {
    const profile = req.body || {};
    const key = process.env.GEMINI_API_KEY;

    if (!key) {
      // fallback deterministic route
      const matches = await fallbackMatchRoles(profile);
      return res.json({ success: true, from: "fallback", matches: matches.slice(0,5) });
    }

    // If user provided GEMINI_API_KEY, attempt to call the API.
    // NOTE: Google/other GenAI endpoints vary — this is a template example.
    const prompt = `Given this user profile: ${JSON.stringify(profile)}\nSuggest up to 5 suitable job roles in JSON: [{ "role": "", "score": 0, "reason": "" }, ...]`;

    // *** IMPORTANT ***
    // Replace GENERATIVE_ENDPOINT with the real endpoint required by your Gemini provider.
    // The code below illustrates calling a hypothetical REST endpoint which may not match exactly.
    const GENERATIVE_ENDPOINT = process.env.GENERATIVE_ENDPOINT || null;

    if (!GENERATIVE_ENDPOINT) {
      // No configured endpoint: fallback
      const matches = await fallbackMatchRoles(profile);
      return res.json({ success: true, from: "fallback", matches: matches.slice(0,5) });
    }

    // Example request (you may need to adapt headers/payload to the actual API)
    const aiResp = await axios.post(GENERATIVE_ENDPOINT, {
      prompt,
      max_output_tokens: 400
    }, {
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json"
      }
    });

    // Try to parse JSON from AI response safely
    let text = "";
    if (aiResp.data && aiResp.data.output) {
      text = aiResp.data.output;
    } else if (aiResp.data && aiResp.data.choices && aiResp.data.choices[0]) {
      text = aiResp.data.choices[0].text || JSON.stringify(aiResp.data.choices[0]);
    } else {
      text = JSON.stringify(aiResp.data);
    }

    // Attempt to JSON.parse, otherwise send raw text
    try {
      const parsed = JSON.parse(text);
      return res.json({ success: true, from: "ai", matches: parsed });
    } catch (e) {
      return res.json({ success: true, from: "ai_text", text });
    }

  } catch (err) {
    console.error("AI match error:", err.message);
    // final fallback
    const matches = await fallbackMatchRoles(req.body || {});
    return res.json({ success: true, from: "fallback_on_error", matches: matches.slice(0,5), error: err.message });
  }
});

module.exports = router;
