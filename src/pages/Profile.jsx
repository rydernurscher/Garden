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
  const [isDark, setIsDark]       = useState(localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    // Populate fields from Supabase user_metadata
    if (user) {
      setFullName(user.user_metadata?.full_name || '');
      setAvatarUrl(user.user_metadata?.avatar_url || '');
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    // Apply dark mode on mount and whenever isDark changes
    if (isDark) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
  }, [isDark]);

  const handleToggleDark = () => {
    if (isDark) {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

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
    return <div className="loading-screen">Loading…</div>;
  }

  return (
    <div className="profile-page" style={{ width: '100%', padding: '2rem' }}>
      <div
        className="card profile-form"
        style={{
          width:         '100%',
          maxWidth:      '800px',
          margin:        '0 auto',
          padding:       '2rem',
          display:       'grid',
          gridTemplateColumns: '1fr 2fr',
          gridGap:       '1.5rem',
          alignItems:    'start',
        }}
      >
        {/* Section Title */}
        <div style={{ gridColumn: '1 / -1', marginBottom: '1rem', textAlign: 'center' }}>
          <h2>Your Profile</h2>
        </div>

        {/* Avatar Preview */}
        <div style={{ textAlign: 'center' }}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="avatar"
              style={{
                width:        '150px',
                height:       '150px',
                objectFit:    'cover',
                borderRadius: '50%',
                border:       '3px solid var(--color-primary)',
              }}
            />
          ) : (
            <div
              style={{
                width:           '150px',
                height:          '150px',
                backgroundColor: '#e2e8f0',
                borderRadius:    '50%',
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                color:           'var(--color-placeholder)',
                fontSize:        '1.2rem',
                border:          '3px solid var(--color-input-border)',
              }}
            >
              No Avatar
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridRowGap: '1.25rem' }}>
          {/* Email (read-only) */}
          <div className="form-group">
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
              Email
            </label>
            <p
              style={{
                padding:        '0.75rem',
                background:     '#f7fafc',
                borderRadius:   '6px',
                border:         '1px solid var(--color-input-border)',
                color:          'var(--color-text)',
              }}
            >
              {user.email}
            </p>
          </div>

          {/* Full Name Input */}
          <div className="form-group">
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
              Full Name
            </label>
            <input
              type="text"
              className="input-text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          {/* Avatar URL Input */}
          <div className="form-group">
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
              Avatar URL
            </label>
            <input
              type="text"
              className="input-text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="Paste an avatar image URL"
            />
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="form-group" style={{ color: 'var(--color-error)' }}>
              {errorMsg}
            </div>
          )}

          {/* Update Button */}
          <div className="form-group" style={{ textAlign: 'right' }}>
            <button
              className="btn glow-btn"
              onClick={handleUpdate}
              disabled={loading}
              style={{ padding: '0.75rem 1.5rem' }}
            >
              {loading ? 'Updating…' : 'Save Changes'}
            </button>
          </div>

          {/* Dark Mode Toggle (new) */}
          <div className="form-group" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button
              className="btn glow-btn"
              onClick={handleToggleDark}
              style={{ padding: '0.6rem 1.2rem', width: '100%' }}
            >
              {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
