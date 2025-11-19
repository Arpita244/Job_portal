// src/components/Navbar.jsx
import React, { useState, useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import "../styles/navbar.css";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="brand">
          <Link to="/">JobSupi</Link>
        </div>

        <div className={`links ${open ? "open" : ""}`}>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/jobs">Jobs</NavLink>
          <NavLink to="/profile-wizard">Profile</NavLink>
          <NavLink to="/assistant">Buddy Bot</NavLink>
          {!user ? (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/signup">Signup</NavLink>
            </>
          ) : (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <button className="logout-btn" onClick={logout}>Logout</button>
            </>
          )}
        </div>

        <button className="hamburger" onClick={() => setOpen((s) => !s)}>
          ☰
        </button>
      </div>
    </nav>
  );
}
