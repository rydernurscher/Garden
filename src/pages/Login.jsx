import React, { useState } from 'react';
import { supabase } from '../api/supabaseClient';
import { useNavigate } from 'react-router-dom';
import '../styles/styles.css';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  // Sign in
  const handleLogin = async () => {
    setErrorMsg('');
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Both email and password are required.');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email:    email.trim(),
      password: password.trim(),
    });
    setLoading(false);
    if (error) setErrorMsg(error.message);
    else if (data.session) navigate('/');
  };

  // Register a new user
  const handleRegister = async () => {
    setErrorMsg('');
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Both email and password are required to register.');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email:    email.trim(),
      password: password.trim(),
    });
    setLoading(false);
    if (error) setErrorMsg(error.message);
    else {
      alert('Registration successful! Check your email to confirm before logging in.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form">
        <h2>Garden Planner</h2>
        <p>{loading ? 'Please wait…' : 'Enter your credentials'}</p>

        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          className="input-text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          id="password"
          type="password"
          placeholder="••••••••"
          className="input-text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="btn glow-btn"
          onClick={handleLogin}
          disabled={loading}
          style={{ marginBottom: '0.75rem' }}
        >
          Login
        </button>

        <button
          className="btn glow-btn"
          onClick={handleRegister}
          disabled={loading}
        >
          Register
        </button>

        {errorMsg && <p className="error">{errorMsg}</p>}
      </div>
    </div>
  );
}
