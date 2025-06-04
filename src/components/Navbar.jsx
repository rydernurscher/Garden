// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../api/supabaseClient';
import '../styles/styles.css';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('supabase.auth.token');
    navigate('/login');
  };

  const getActive = (path) =>
    location.pathname === path ? 'nav-item active' : 'nav-item';

  return (
    <aside className="sidebar">
      <Link to="/about"    className={getActive('/about')}>
        About
      </Link>
      <Link to="/"         className={getActive('/')}>
        Dashboard
      </Link>
      <Link to="/library"  className={getActive('/library')}>
        Plant Library
      </Link>
      <Link to="/planner"  className={getActive('/planner')}>
        Planner
      </Link>
      <Link to="/profile"  className={getActive('/profile')}>
        Profile
      </Link>
      <Link to="/forum"    className={getActive('/forum')}>
        Community Forum
      </Link>

      <button onClick={handleLogout} className="btn glow-btn" style={{ marginTop: 'auto' }}>
        Logout
      </button>
    </aside>
  );
}
