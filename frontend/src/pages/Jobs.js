// src/pages/Jobs.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import "../styles/jobs.css";
import { Link } from "react-router-dom";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/jobs").then(res => {
      if (res.data && res.data.jobs) setJobs(res.data.jobs);
      else if (Array.isArray(res.data)) setJobs(res.data);
    }).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  return (
    <div>
      <h2>Available Jobs</h2>
      {loading ? <p>Loading...</p> :
        <div className="job-grid">
          {jobs.map(j => (
            <div className="job-card" key={j._id || j.title}>
              <h3>{j.title}</h3>
              <p className="muted">{j.company} • {j.location}</p>
              <p className="muted">₹{j.salary || "N/A"}</p>
              <p>{j.description?.slice(0,120)}{j.description && j.description.length>120 ? "..." : ""}</p>
              <div style={{ marginTop: 8 }}>
                <Link to={`/jobs/${j._id || ""}`}><button className="btn-small">View</button></Link>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  );
}
