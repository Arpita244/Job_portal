// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProfileWizard from "./pages/ProfileWizard";
import RoleSuggestions from "./pages/RoleSuggestions";
import Roadmap from "./pages/Roadmap";
import Assistant from "./pages/Assistant";

export default function App() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: "24px auto", padding: "0 16px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile-wizard" element={<ProfileWizard />} />
          <Route path="/role-suggestions" element={<RoleSuggestions />} />
          <Route path="/roadmap/:role" element={<Roadmap />} />
          <Route path="/assistant" element={<Assistant />} />
        </Routes>
      </main>
    </>
  );
}
