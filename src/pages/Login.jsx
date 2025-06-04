// src/pages/Login.jsx
import React, { useState } from 'react';
import { supabase } from '../api/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Email & password required');
      return;
    }

    // Attempt sign-in
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    if (data.session) {
      // Supabase will auto-persist session into localStorage (because persistSession:true).
      // Now redirect to “/” (App.jsx sees “session” change and re-renders)
      navigate('/');
    }
  };

  const handleRegister = async () => {
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Email & password required');
      return;
    }
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    alert('Registered—check your email for confirmation before logging in.');
  };

  return (
    <div className="login-body">
      <div className="login-card">
        <h2>MyGarden Planner</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button className="btn" onClick={handleLogin}>
          Login
        </button>
        <button className="link-btn" onClick={handleRegister}>
          Register
        </button>
        {errorMsg && <p className="error">{errorMsg}</p>}
      </div>
    </div>
  );
}
