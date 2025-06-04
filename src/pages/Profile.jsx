// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';

export default function Profile({ session }) {
  const [loading, setLoading]     = useState(true);
  const [fullName, setFullName]   = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [errorMsg, setErrorMsg]   = useState('');

  // On mount, populate fields from session.user.user_metadata directly
  useEffect(() => {
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

  if (loading) return <p>Loading...</p>;

  return (
    <div className="profile-page">
      <h2>Profile</h2>
      <div className="profile-form">
        <label>
          <strong>Email:</strong> {session.user.email}
        </label>

        <label>Full Name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Enter your full name"
        />

        <label>Avatar URL</label>
        <input
          type="text"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="Paste an avatar image URL"
        />

        {avatarUrl && (
          <div className="avatar-preview">
            <label>Preview:</label>
            <img
              src={avatarUrl}
              alt="avatar preview"
              style={{ maxWidth: '150px', borderRadius: '8px' }}
            />
          </div>
        )}

        <button className="btn" onClick={handleUpdate}>
          Update Profile
        </button>

        {errorMsg && <p className="error">{errorMsg}</p>}
      </div>
    </div>
  );
}
