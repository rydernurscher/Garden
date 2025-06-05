import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <div className="sidebar">
      {/* Indicator visible in the 20px strip when sidebar is closed */}
      <div className="sidebar-indicator">⋮</div>

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
