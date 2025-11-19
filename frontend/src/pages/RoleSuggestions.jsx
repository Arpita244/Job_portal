// src/pages/RoleSuggestions.jsx
import React, { useState } from "react";
import api from "../api";
import RoleCard from "../components/RoleCard";

export default function RoleSuggestions() {
  const [profileText, setProfileText] = useState("");
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMatches = async () => {
    let profile = {};
    try {
      profile = JSON.parse(profileText);
    } catch {
      alert("Paste JSON profile (from profile creation) or enter {}");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/ai/match", profile);
      if (res.data && res.data.matches) setMatches(res.data.matches);
      else if (res.data && res.data.from && res.data.matches) setMatches(res.data.matches);
      else setMatches(res.data || []);
    } catch (e) {
      alert("Failed to get matches");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>AI Role Suggestions</h2>
      <p>Paste the saved profile JSON (from backend response) or leave blank to use fallback DB roles.</p>
      <textarea placeholder='{"skills":["riding"], "interests":["delivery"]}' rows={6} value={profileText} onChange={e=>setProfileText(e.target.value)} style={{ width: "100%" }} />
      <div style={{ marginTop: 12 }}>
        <button className="btn" onClick={fetchMatches} disabled={loading}>{loading ? "Working..." : "Get Suggestions"}</button>
      </div>

      <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
        {matches.map((m, i) => (
          <div key={i} style={{ background: "white", padding: 12, borderRadius: 8 }}>
            <h3 style={{ margin: 0 }}>{m.role}</h3>
            <p className="muted">{m.description || m.reason}</p>
            <p>Score: {m.score}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
