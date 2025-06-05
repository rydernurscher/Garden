import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <div className="sidebar">
      {/* More prominent three‐dot indicator with primary colour */}
      <div className="sidebar-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Navigation links */}
      <NavLink to="/" className="nav-item">
        Dashboard
      </NavLink>
      <NavLink to="/library" className="nav-item">
        Plant Library
      </NavLink>
      <NavLink to="/planner" className="nav-item">
        Planner
      </NavLink>
      <NavLink to="/profile" className="nav-item">
        Profile
      </NavLink>
      <NavLink to="/settings" className="nav-item">
        Settings
      </NavLink>
      <NavLink to="/forum" className="nav-item">
        Forum
      </NavLink>
      <NavLink to="/notifications" className="nav-item">
        Inbox
      </NavLink>
    </div>
  );
}
