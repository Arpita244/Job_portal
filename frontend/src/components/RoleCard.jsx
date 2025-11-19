// src/components/RoleCard.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function RoleCard({ role }) {
  return (
    <div style={{
      background: "white",
      borderRadius: 8,
      padding: 16,
      boxShadow: "0 6px 20px rgba(16,24,40,0.06)"
    }}>
      <h3 style={{ margin: 0 }}>{role.role}</h3>
      <p style={{ color: "#444" }}>{role.description}</p>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <Link to={`/roadmap/${encodeURIComponent(role.role)}`}>
          <button className="btn-small">Roadmap</button>
        </Link>
        <Link to="/jobs">
          <button className="btn-small btn-outline">See Jobs</button>
        </Link>
      </div>
    </div>
  );
}
