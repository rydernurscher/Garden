// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../api/supabaseClient';
import '../styles/styles.css';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize dark mode from localStorage
  const [isDark, setIsDark] = useState(
    localStorage.getItem('theme') === 'dark'
  );

  // On mount, apply the correct body class
  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDark]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('supabase.auth.token');
    navigate('/login');
  };

  const toggleTheme = () => {
    if (isDark) {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDark(!isDark);
  };

  const getActive = (path) =>
    location.pathname === path ? 'nav-item active' : 'nav-item';

  return (
    <aside className="sidebar">
      <Link to="/"        className={getActive('/')}>
        Dashboard
      </Link>
      <Link to="/library" className={getActive('/library')}>
        Plant Library
      </Link>
      <Link to="/planner" className={getActive('/planner')}>
        Planner
      </Link>
      <Link to="/profile" className={getActive('/profile')}>
        Profile
      </Link>

      <button onClick={handleLogout} className="btn glow-btn" style={{ marginTop: 'auto' }}>
        Logout
      </button>

      <button
        onClick={toggleTheme}
        className="btn small glow-btn"
        style={{ marginTop: '1rem' }}
      >
        {isDark ? 'Light Mode' : 'Dark Mode'}
      </button>
    </aside>
  );
}
