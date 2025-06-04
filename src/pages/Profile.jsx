// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';

export default function Profile({ session }) {
  const [loading, setLoading]     = useState(true);
  const [fullName, setFullName]   = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [errorMsg, setErrorMsg]   = useState('');

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setFullName(user.user_metadata?.full_name || '');
        setAvatarUrl(user.user_metadata?.avatar_url || '');
      }

      setLoading(false);
    })();
  }, []);

  const handleUpdate = async () => {
    setErrorMsg('');
    setLoading(true);

    const updates = {
      data: {
        full_name:   fullName,
        avatar_url:  avatarUrl,
      },
    };

    const { error } = await supabase.auth.updateUser(updates);
    if (error) {
      setErrorMsg(error.message);
    } else {
      alert('Profile updated');
    }

    setLoading(false);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="profile-page">
      <h2>Profile</h2>
      <div className="profile-form">
        <label>Email: {session.user.email}</label>

        <label>Full Name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <label>Avatar URL</label>
        <input
          type="text"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
        />

        <button className="btn" onClick={handleUpdate}>
          Update Profile
        </button>

        {errorMsg && <p className="error">{errorMsg}</p>}
      </div>
    </div>
  );
}
