// src/pages/Signup.jsx
import React, { useState } from "react";
import api from "../api";
import "../styles/auth.css";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // For demo we do not call backend sign-up; redirect to login
    alert("Signup saved (demo). Proceed to login.");
    navigate("/login");
  };

  return (
    <div className="auth-card">
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} required />
        <label>Phone</label>
        <input value={phone} onChange={e=>setPhone(e.target.value)} required />
        <button className="btn" type="submit">Signup</button>
      </form>
    </div>
  );
}
