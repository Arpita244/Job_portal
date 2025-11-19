// src/pages/Dashboard.jsx
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import RoleCard from "../components/RoleCard";
import "../styles/dashboard.css";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    api.get("/roles").then(res => {
      if (res.data && res.data.roles) setRoles(res.data.roles);
      else if (Array.isArray(res.data)) setRoles(res.data);
    }).catch(()=>{});
  }, []);

  return (
    <div>
      <h2>Welcome{user ? `, ${user.name || user.phone}` : ""}</h2>
      <p>Here are some suggested roles to explore.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
        {roles.map(r => <RoleCard key={r._id || r.role} role={r} />)}
      </div>
    </div>
  );
}
