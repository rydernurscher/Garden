// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../api/supabaseClient';
import '../styles/styles.css'; // Ensure styles are loaded

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
      <Link to="/"        className={getActive('/')}>Dashboard</Link>
      <Link to="/library" className={getActive('/library')}>Plant Library</Link>
      <Link to="/planner" className={getActive('/planner')}>Planner</Link>
      <Link to="/profile" className={getActive('/profile')}>Profile</Link>
      <button onClick={handleLogout} className="btn glow-btn">
        Logout
      </button>
    </aside>
  );
}
