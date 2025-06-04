// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';
import '../styles/styles.css';

export default function Profile({ session }) {
  const [loading, setLoading]     = useState(true);
  const [fullName, setFullName]   = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [errorMsg, setErrorMsg]   = useState('');

  useEffect(() => {
    // Populate from session.user metadata
    const user = session.user;
    if (user) {
      setFullName(user.user_metadata?.full_name || '');
      setAvatarUrl(user.user_metadata?.avatar_url || '');
    }
    setLoading(false);
  }, [session]);

  const handleUpdate = async () => {
    setErrorMsg('');
    setLoading(true);

    const updates = {
      data: {
        full_name:  fullName,
        avatar_url: avatarUrl,
      },
    };

    const { error } = await supabase.auth.updateUser(updates);
    if (error) {
      setErrorMsg(error.message);
    } else {
      alert('Profile updated successfully');
    }
    setLoading(false);
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div className="profile-page">
      <div className="card profile-form">
        <h2>Profile</h2>

        {/* Email (read‐only) */}
        <div className="form-group">
          <label>Email:</label>
          <p>{session.user.email}</p>
        </div>

        {/* Full Name */}
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            className="input-text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
          />
        </div>

        {/* Avatar URL */}
        <div className="form-group">
          <label>Avatar URL</label>
          <input
            type="text"
            className="input-text"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="Paste an avatar image URL"
          />
        </div>

        {/* Live Preview */}
        {avatarUrl && (
          <div className="form-group">
            <label>Preview:</label>
            <img
              src={avatarUrl}
              alt="avatar preview"
              style={{ maxWidth: '150px', borderRadius: '8px' }}
            />
          </div>
        )}

        {/* Update Button */}
        <button
          className="btn glow-btn"
          onClick={handleUpdate}
          disabled={loading}
        >
          {loading ? 'Updating…' : 'Update Profile'}
        </button>

        {errorMsg && <p className="error">{errorMsg}</p>}
      </div>
    </div>
  );
}
