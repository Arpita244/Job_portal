// backend/routes/aiRoutes.js
const express = require("express");
const axios = require("axios");
const Role = require("../models/Role");
const Job = require("../models/Job"); // optional DB lookup for jobs

const router = express.Router();

/* ---------- fallbackMatchRoles (unchanged) ---------- */
function fallbackMatchRoles(profile) {
  return Role.find({}).then((roles) => {
    const profileSkills = (profile.skills || []).map((s) => s.toLowerCase());
    return roles
      .map((r) => {
        const roleSkills = (r.skills_required || []).map((s) => s.toLowerCase());
        const matches = roleSkills.filter((s) => profileSkills.includes(s)).length;
        const score = Math.min(
          100,
          matches * 30 + (profile.interests && profile.interests.length ? 10 : 0)
        );
        return {
          role: r.role,
          description: r.description,
          score,
          skills_required: r.skills_required,
        };
      })
      .sort((a, b) => b.score - a.score);
  });
}

/* ---------- existing /match endpoint (unchanged) ---------- */
router.post("/match", async (req, res) => {
  try {
    const profile = req.body || {};
    const key = process.env.GEMINI_API_KEY;

    if (!key) {
      const matches = await fallbackMatchRoles(profile);
      return res.json({ success: true, from: "fallback", matches: matches.slice(0, 5) });
    }

    const prompt = `Given this user profile: ${JSON.stringify(profile)}
Suggest up to 5 suitable job roles in JSON: [{"role": "", "score": 0, "reason": ""}, ...]`;

    const GENERATIVE_ENDPOINT = process.env.GENERATIVE_ENDPOINT;
    if (!GENERATIVE_ENDPOINT) {
      const matches = await fallbackMatchRoles(profile);
      return res.json({ success: true, from: "fallback", matches: matches.slice(0, 5) });
    }

    const aiResp = await axios.post(
      GENERATIVE_ENDPOINT,
      { prompt, max_output_tokens: 400 },
      {
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
      }
    );

    let text = "";
    if (aiResp.data?.output) text = aiResp.data.output;
    else if (aiResp.data?.choices?.[0]) text = aiResp.data.choices[0].text;
    else text = JSON.stringify(aiResp.data);

    try {
      const parsed = JSON.parse(text);
      return res.json({ success: true, from: "ai", matches: parsed });
    } catch {
      return res.json({ success: true, from: "ai_text", text });
    }
  } catch (err) {
    console.error("AI match error:", err.message);
    const matches = await fallbackMatchRoles(req.body || {});
    return res.json({
      success: true,
      from: "fallback_on_error",
      matches: matches.slice(0, 5),
      error: err.message,
    });
  }
});

/* -----------------------------------------------------------
   UNIVERSAL /ai/chat endpoint (learning, job search, roles)
   - returns: { success: true, reply: { text, resources[], jobs[] } }
----------------------------------------------------------- */
router.post("/chat", async (req, res) => {
  try {
    const { query = "", profile = {} } = req.body || {};
    const q = String(query || "").trim();
    const qLower = q.toLowerCase();

    // -----------------------
    // Helper: extract skill/topic
    // -----------------------
    function extractSkill(text) {
      // Prefer patterns like "jobs for X", "job for X", "learn X", "how to learn X", "X jobs"
      let m;

      m = text.match(/\bjobs?\s+(?:for\s+)?([\w\s-]{2,50})/i);
      if (m && m[1]) return m[1].trim();

      m = text.match(/\blearn\s+([\w\s-]{2,50})/i);
      if (m && m[1]) return m[1].trim();

      m = text.match(/\bhow to learn\s+([\w\s-]{2,50})/i);
      if (m && m[1]) return m[1].trim();

      m = text.match(/\bwhat jobs (?:are )?in\s+([\w\s-]{2,50})/i);
      if (m && m[1]) return m[1].trim();

      // last resort: pick first keyword-looking word
      const tokens = text.split(/\s+/).filter(Boolean);
      if (tokens.length > 0) return tokens.slice(-2).join(" "); // take last two words
      return text;
    }

    const skillRaw = extractSkill(qLower);
    const skill = (skillRaw || "").replace(/\?|\./g, "").trim();

    // -----------------------
    // Helper: normalized keywords map
    // -----------------------
    function normalizeSkill(s) {
      if (!s) return "";
      if (s.includes("cook")) return "cooking";
      if (s.includes("elect")) return "electrician";
      if (s.includes("wire")) return "electrical wiring";
      if (s.includes("deliver") || s.includes("rider")) return "delivery";
      if (s.includes("code") || s.includes("program")) return "coding";
      if (s.includes("plumb")) return "plumbing";
      if (s.includes("carp")) return "carpentry";
      if (s.includes("driver")) return "driver";
      return s;
    }

    const niceTopic = normalizeSkill(skill);

    // -----------------------
    // Intent detection
    // -----------------------
    const isJobSearch =
      /\bjob(s)?\b/i.test(qLower) ||
      /\bvacan(cy|cies)\b/i.test(qLower) ||
      /\bhiring\b/i.test(qLower) ||
      /\bhire\b/i.test(qLower) ||
      qLower.includes("jobs for") ||
      qLower.includes("job for") ||
      qLower.includes("jobs in");

    const isLearning =
      qLower.includes("how to learn") ||
      qLower.startsWith("learn ") ||
      qLower.includes("how do i learn") ||
      qLower.includes("improve in") ||
      qLower.includes("how to");

    // -----------------------
    // Job database (fallback local list)
    // -----------------------
    const jobDB = {
      cooking: [
        { role: "Kitchen Assistant", desc: "Helps with prep, cleaning and basic cooking." },
        { role: "Line Cook", desc: "Works a specific station; beginner-friendly." },
        { role: "Home Cook / Tiffin Maker", desc: "Cook from home and sell locally." },
      ],
      electrician: [
        { role: "Electrician Helper", desc: "Assists in wiring and basic electrical tasks." },
        { role: "Apprentice Electrician", desc: "Learn on the job with a licensed electrician." },
      ],
      delivery: [
        { role: "Delivery Rider", desc: "Local parcel delivery using a bike/scooter." },
        { role: "Warehouse Assistant", desc: "Package sorting & basic logistics." },
      ],
      coding: [
        { role: "Intern Web Developer", desc: "Basic HTML/CSS/JS tasks for small projects." },
        { role: "Junior Frontend Developer", desc: "React/JS knowledge helpful." },
      ],
      plumbing: [
        { role: "Plumber Helper", desc: "Assists experienced plumbers in repairs." },
      ],
      carpentry: [
        { role: "Carpenter Helper", desc: "Helps with cutting, sanding, and finishing." },
      ],
      driver: [
        { role: "Delivery Driver", desc: "Drive and deliver packages locally." },
        { role: "Taxi Driver", desc: "Drive passengers using an app or taxi service." },
      ],
    };

    // -----------------------
    // Resource generator
    // -----------------------
    function learningResources(t) {
      const qenc = encodeURIComponent(t || "");
      if (!t) {
        return [
          { title: "YouTube - Beginner tutorials", url: "https://www.youtube.com/results?search_query=beginner+tutorials" },
          { title: "Google - How to learn", url: "https://www.google.com/search?q=how+to+learn+new+skill" },
        ];
      }
      if (t === "cooking") {
        return [
          { title: "Cooking Basics - YouTube", url: "https://www.youtube.com/results?search_query=cooking+for+beginners" },
          { title: "Serious Eats", url: "https://www.seriouseats.com/" },
          { title: "Coursera cooking courses", url: "https://www.coursera.org/search?query=cooking" },
        ];
      }
      if (t === "electrician" || t.includes("electrical")) {
        return [
          { title: "Electrical basics - YouTube", url: "https://www.youtube.com/results?search_query=electrical+basics+for+beginners" },
          { title: "Skill India - Electrical Programs", url: "https://skillindia.nsdcindia.org/" },
          { title: "Local vocational courses", url: "https://www.google.com/search?q=vocational+electrician+course+near+me" },
        ];
      }
      if (t === "coding" || t === "programming") {
        return [
          { title: "freeCodeCamp", url: "https://www.freecodecamp.org/" },
          { title: "YouTube: coding for beginners", url: "https://www.youtube.com/results?search_query=coding+for+beginners" },
          { title: "MDN Web Docs", url: "https://developer.mozilla.org/" },
        ];
      }
      // generic
      return [
        { title: `YouTube: ${t} tutorials`, url: `https://www.youtube.com/results?search_query=${qenc}+tutorials` },
        { title: `Google: ${t} tutorials`, url: `https://www.google.com/search?q=${qenc}+tutorials` },
      ];
    }

    function jobResources(t) {
      const qenc = encodeURIComponent(t || "");
      return [
        { title: "Naukri", url: `https://www.naukri.com/${qenc}` },
        { title: "Indeed India", url: `https://in.indeed.com/jobs?q=${qenc}` },
        { title: "LinkedIn Jobs", url: `https://www.linkedin.com/jobs/search?keywords=${qenc}` },
      ];
    }

    // -----------------------
    // If user asked for job search -> return jobs + resources
    // -----------------------
    if (isJobSearch) {
      const key = niceTopic || ""; // normalized
      let jobs = [];

      // 1) Prefer DB Job collection search (if available)
      if (key) {
        try {
          const dbJobs = await Job.find({ $or: [{ role: new RegExp(key, "i") }, { title: new RegExp(key, "i") }, { role: new RegExp(key.split(" ")[0], "i") }] }).limit(10);
          if (dbJobs && dbJobs.length) {
            jobs = dbJobs.map(j => ({ title: j.title || j.role, company: j.company, location: j.location, salary: j.salary, description: j.description }));
          }
        } catch (e) {
          // ignore DB error, we'll fallback to jobDB
          console.warn("Job DB lookup failed:", e.message);
        }
      }

      // 2) If no DB results, check local jobDB mapping
      if (!jobs.length) {
        const mapped = jobDB[niceTopic] || jobDB[skill] || jobDB[key] || null;
        if (mapped) {
          jobs = mapped.map(j => ({ role: j.role, description: j.desc }));
        } else {
          // as last resort suggest generic entry roles and job search links
          jobs = [{ role: "Entry-level / Assistant", description: `Search local listings for "${skill || key}"` }];
        }
      }

      const resources = jobResources(niceTopic || skill || "jobs");
      const text = `Found ${jobs.length} job role(s) related to **${niceTopic || skill || "your query"}**. See details below and open the job sites for live listings.`;

      return res.json({
        success: true,
        reply: {
          text,
          resources,
          jobs,
        },
      });
    }

    // -----------------------
    // If user is asking about learning / how to learn
    // -----------------------
    if (isLearning || qLower.includes("how to") || qLower.startsWith("learn")) {
      const t = niceTopic || skill || "a skill";
      const replyText = `Here is a beginner-friendly plan to start learning **${t}**:

1) Start with 2–3 short beginner videos.
2) Practice small tasks daily (hands-on).
3) Follow a short structured course (1–6 weeks).
4) Build a mini-project or help in real tasks.
5) Apply to entry-level roles / apprenticeships to gain experience.

Resources below to get started.`;
      const resources = learningResources(t);
      return res.json({ success: true, reply: { text: replyText, resources } });
    }

    // -----------------------
    // Role explanation or fallback
    // -----------------------
    // If user mentions a role name exactly, try to find it from Role DB
    if (skill) {
      try {
        const roleFromDb = await Role.findOne({ role: new RegExp(skill, "i") });
        if (roleFromDb) {
          const text = `Role: ${roleFromDb.role}\n\n${roleFromDb.description || ""}\n\nSkills required: ${(roleFromDb.skills_required || []).join(", ")}`;
          return res.json({ success: true, reply: { text, resources: [] } });
        }
      } catch (e) {
        console.warn("Role DB lookup failed:", e.message);
      }
    }

    // Default helpful prompt
    return res.json({
      success: true,
      reply: {
        text:
          "I can help with job search, learning a skill, or explaining job roles.\n\nTry: 'jobs for electrician', 'how to learn cooking', 'what is a kitchen assistant'.",
        resources: [],
      },
    });
  } catch (err) {
    console.error("Chat endpoint error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
