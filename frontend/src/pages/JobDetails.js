// src/pages/JobDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import "../styles/jobDetails.css";

export default function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);

  useEffect(() => {
    if (!id) return;
    api.get(`/jobs/${id}`).then(res => {
      if (res.data && res.data.job) setJob(res.data.job);
      else setJob(res.data);
    }).catch(()=>{});
  }, [id]);

  if (!job) return <p>Loading job...</p>;

  return (
    <div className="job-details">
      <h2>{job.title}</h2>
      <p className="muted">{job.company} • {job.location}</p>
      <p><b>Salary:</b> ₹{job.salary || "N/A"}</p>
      <h3>Description</h3>
      <p>{job.description}</p>
      <h3>Required Skills</h3>
      <ul>
        {(job.skills || []).map((s, i) => <li key={i}>{s}</li>)}
      </ul>
      <button className="btn">Apply Now</button>
    </div>
  );
}
