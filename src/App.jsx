import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './api/supabaseClient';
import './styles/styles.css';

import Navbar       from './components/Navbar';
import Login        from './pages/Login';
import Dashboard    from './pages/Dashboard';
import PlantLibrary from './pages/PlantLibrary';
import Planner      from './pages/Planner';
import Profile      from './pages/Profile';

function App() {
  // undefined = still loading, null = no user, object = logged in
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return <div className="loading-screen">Loading…</div>;
  }

  const ProtectedRoute = ({ children }) => {
    return session ? children : <Navigate to="/login" replace />;
  };

  return (
    <div className="app-body">
      {session && <Navbar />}
      <main className="container" style={{ marginLeft: session ? '240px' : '0' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
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
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile session={session} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
