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
import Settings     from './pages/Settings';
import Forum        from './pages/Forum';
import About        from './pages/About';
import Notifications from './pages/Notifications';

function App() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
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
      <main className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={
            <ProtectedRoute>
              <About session={session} />
            </ProtectedRoute>
          }/>
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard session={session} />
            </ProtectedRoute>
          }/>
          <Route path="/library" element={
            <ProtectedRoute>
              <PlantLibrary session={session} />
            </ProtectedRoute>
          }/>
          <Route path="/planner" element={
            <ProtectedRoute>
              <Planner session={session} />
            </ProtectedRoute>
          }/>
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile session={session} />
            </ProtectedRoute>
          }/>
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings session={session} />
            </ProtectedRoute>
          }/>
          <Route path="/forum" element={
            <ProtectedRoute>
              <Forum session={session} />
            </ProtectedRoute>
          }/>
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Notifications session={session} />
            </ProtectedRoute>
          }/>
        </Routes>
      </main>
    </div>
  );
}

export default App;
