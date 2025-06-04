// src/App.jsx
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './api/supabaseClient';

import Navbar       from './components/Navbar';
import Login        from './pages/Login';
import Dashboard    from './pages/Dashboard';
import PlantLibrary from './pages/PlantLibrary';
import Planner      from './pages/Planner';

function App() {
  // undefined = still loading, null = no user, object = logged in
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    // 1) On mount, attempt to get an existing session from localStorage or URL
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 2) Listen for future auth changes (login, logout, token refresh, etc.)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // While session is still undefined (we haven’t confirmed localStorage or URL), show a spinner
  if (session === undefined) {
    return (
      <div style={{
        height:   '100vh',
        display:  'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.2rem'
      }}>
        Loading…
      </div>
    );
  }

  // If no session (session === null), force redirect to /login
  const ProtectedRoute = ({ children }) => {
    return session ? children : <Navigate to="/login" replace />;
  };

  return (
    <div className="app-body">
      {session && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route
            path="/login"
            element={session ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard session={session} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <PlantLibrary session={session} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/planner"
            element={
              <ProtectedRoute>
                <Planner session={session} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
