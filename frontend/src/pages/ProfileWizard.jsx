// src/pages/ProfileWizard.jsx
import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";

export default function ProfileWizard() {
  const [form, setForm] = useState({ name: "", phone: "", skills: "", interests: "", location: "", salaryPreference: "" });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
        interests: form.interests.split(",").map(s => s.trim()).filter(Boolean),
        salaryPreference: Number(form.salaryPreference || 0)
      };
      const res = await api.post("/profile/create", payload);
      alert("Profile saved");
      navigate("/role-suggestions", { state: { profile: res.data.user } });
    } catch (e) {
      alert("Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2>Build Profile</h2>
      <label>Name</label>
      <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
      <label>Phone</label>
      <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
      <label>Skills (comma separated)</label>
      <input value={form.skills} onChange={e=>setForm({...form,skills:e.target.value})} />
      <label>Interests (comma separated)</label>
      <input value={form.interests} onChange={e=>setForm({...form,interests:e.target.value})} />
      <label>Location</label>
      <input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} />
      <label>Preferred minimum salary</label>
      <input value={form.salaryPreference} onChange={e=>setForm({...form,salaryPreference:e.target.value})} />

      <button className="btn" onClick={save} disabled={loading}>{loading ? "Saving..." : "Save Profile"}</button>
    </div>
  );
}
