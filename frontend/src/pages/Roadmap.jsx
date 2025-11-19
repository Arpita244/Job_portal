// src/pages/Roadmap.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

export default function Roadmap() {
  const { role } = useParams();
  const [roadmap, setRoadmap] = useState(null);

  useEffect(() => {
    if (!role) return;
    api.get(`/roadmap/${encodeURIComponent(role)}`).then(res => {
      if (res.data && res.data.roadmap) setRoadmap(res.data.roadmap);
      else setRoadmap(res.data);
    }).catch(()=>{});
  }, [role]);

  if (!roadmap) return <p>Loading roadmap...</p>;

  return (
    <div>
      <h2>Roadmap — {role}</h2>
      <p><b>Duration:</b> {roadmap.duration || "2-8 weeks"}</p>
      <ol>
        {(roadmap.steps || []).map((s,i) => <li key={i}>{s}</li>)}
      </ol>
      <h4>Resources</h4>
      <ul>
        {(roadmap.resources || []).map((r,i) => <li key={i}>{r}</li>)}
      </ul>
    </div>
  );
}
