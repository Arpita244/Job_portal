import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api";
import "../styles/auth.css";

export default function RoleSuggestions() {
  const location = useLocation();
  const [profile, setProfile] = useState(location.state?.profile || null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAI = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const res = await api.post("/ai/suggest", profile);
      setSuggestions(res.data.suggestions || []);
    } catch (e) {
      alert("AI failed");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAI();
  }, []);

  return (
    <div className="auth-card">
      <h2>AI Role Suggestions</h2>

      {profile && (
        <div className="saved-profile">
          <p><b>Name:</b> {profile.name}</p>
          <p><b>Skills:</b> {profile.skills?.join(", ")}</p>
          <p><b>Interests:</b> {profile.interests?.join(", ")}</p>
          <p><b>Location:</b> {profile.location}</p>
          <p><b>Salary Preference:</b> {profile.salaryPreference}</p>
        </div>
      )}

      <button className="btn" onClick={fetchAI} disabled={loading}>
        {loading ? "Getting AI Suggestions..." : "Get Suggestions"}
      </button>

      <div style={{ marginTop: "20px" }}>
        {suggestions.map((s, i) => (
          <div key={i} className="result-card">
            <h3>{s.title}</h3>
            <p>{s.why_match}</p>
            <p><b>Score:</b> {s.score}</p>
            <p><b>Apply:</b></p>
            <ul>
              {s.apply_links.map((l, j) => (
                <li key={j}>
                  <a href={l.url} target="_blank" rel="noreferrer">{l.site}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
