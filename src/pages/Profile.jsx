// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';
import '../styles/styles.css';

export default function Profile({ session }) {
  const user = session.user;
  const [loading, setLoading]     = useState(true);
  const [fullName, setFullName]   = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [errorMsg, setErrorMsg]   = useState('');

  useEffect(() => {
    // Populate fields from Supabase user_metadata
    if (user) {
      setFullName(user.user_metadata?.full_name || '');
      setAvatarUrl(user.user_metadata?.avatar_url || '');
    }
    setLoading(false);
  }, [user]);

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

  if (loading) {
    return (
      <div className="profile-page">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="profile-page" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="card profile-form" style={{ maxWidth: '500px', width: '100%', padding: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>Your Profile</h2>

        {/* Avatar Preview */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="avatar"
              style={{
                width: '120px',
                height: '120px',
                objectFit: 'cover',
                borderRadius: '50%',
                border: '3px solid #3182ce',
              }}
            />
          ) : (
            <div
              style={{
                width:           '120px',
                height:          '120px',
                backgroundColor: '#e2e8f0',
                borderRadius:    '50%',
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                color:           '#718096',
                fontSize:        '1.2rem',
                border:          '3px solid #cbd5e0',
              }}
            >
              No Avatar
            </div>
          )}
        </div>

        {/* Email (read-only) */}
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Email</label>
          <p style={{ padding: '0.5rem', background: '#f7fafc', borderRadius: '6px' }}>
            {user.email}
          </p>
        </div>

        {/* Full Name Input */}
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Full Name</label>
          <input
            type="text"
            className="input-text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
          />
        </div>

        {/* Avatar URL Input */}
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>Avatar URL</label>
          <input
            type="text"
            className="input-text"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="Paste an avatar image URL"
          />
        </div>

        {errorMsg && (
          <p className="error" style={{ marginBottom: '1rem' }}>{errorMsg}</p>
        )}

        {/* Update Button */}
        <button
          className="btn glow-btn"
          onClick={handleUpdate}
          disabled={loading}
          style={{ width: '100%', marginTop: '1rem' }}
        >
          {loading ? 'Updating…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
