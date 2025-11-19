// src/pages/Login.jsx
import React, { useState, useContext } from "react";
import api from "../api";
import "../styles/auth.css";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [phone, setPhone] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // For this project we use a simple fake login: call backend to fetch a user by phone (not implemented)
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Try to find a profile via /profile? (backend doesn't have phone get; fallback: simulate)
    try {
      // For now just store phone as user
      const user = { name: "User", phone };
      login(user);
      navigate("/dashboard");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="auth-card">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label>Phone</label>
        <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Enter phone (for demo)" required />
        <button className="btn" type="submit">Login</button>
      </form>
    </div>
  );
}
