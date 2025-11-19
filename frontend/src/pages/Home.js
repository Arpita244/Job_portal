import React from "react";
import "../styles/home.css";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="home-title">Find Your Dream Job</h1>
        <p className="home-subtitle">
          Search thousands of opportunities and apply in one click.
        </p>

        <div className="home-buttons">
          <Link to="/jobs" className="btn-primary">Browse Jobs</Link>
          <br/>
          <Link to="/login" className="btn-secondary">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
