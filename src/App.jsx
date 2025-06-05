// src/App.jsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './api/supabaseClient';
import './styles/styles.css';

import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import PlantLibrary from './pages/PlantLibrary';
import Planner from './pages/Planner';
import Profile from './pages/Profile';
import OtherUserProfile from './pages/OtherUserProfile';
import Settings from './pages/Settings';
import Forum from './pages/Forum';
import Notifications from './pages/Notifications';
import About from './pages/About';
import Login from './pages/Login';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Fetch initial session
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    getSession();

    // Listen for auth state changes
    const { subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // If not logged in, redirect to /login
  if (!session) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <div className="app-body">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Dashboard session={session} />} />
            <Route path="/library" element={<PlantLibrary session={session} />} />
            <Route path="/planner" element={<Planner session={session} />} />
            <Route path="/profile" element={<Profile session={session} />} />
            <Route
              path="/profile/:userId"
              element={<OtherUserProfile session={session} />}
            />
            <Route path="/settings" element={<Settings session={session} />} />
            <Route path="/forum" element={<Forum session={session} />} />
            <Route
              path="/notifications"
              element={<Notifications session={session} />}
            />
            <Route path="/about" element={<About />} />
            {/* Catch-all: redirect unknown routes back to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
