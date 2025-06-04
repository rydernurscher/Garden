// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabaseClient';
import '../styles/styles.css';

export default function Profile({ session }) {
  const user = session.user;

  // Profile fields
  const [loading, setLoading]       = useState(true);
  const [username, setUsername]     = useState('');
  const [fullName, setFullName]     = useState('');
  const [avatarUrl, setAvatarUrl]   = useState('');
  const [errorMsg, setErrorMsg]     = useState('');
  const [isDark, setIsDark]         = useState(localStorage.getItem('theme') === 'dark');

  // Social fields
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersList, setFollowersList]   = useState([]); // [{ id, username, avatar_url }]
  const [followingList, setFollowingList]   = useState([]);

  useEffect(() => {
    // Populate basic profile data
    if (user) {
      setUsername(user.user_metadata?.username || '');
      setFullName(user.user_metadata?.full_name || '');
      setAvatarUrl(user.user_metadata?.avatar_url || '');
    }
    fetchSocialData(); // load followers / following
    setLoading(false);
  }, [user]);

  useEffect(() => {
    // Apply dark mode
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
        username,
        full_name:  fullName,
        avatar_url: avatarUrl,
      },
    };

    const { error } = await supabase.auth.updateUser(updates);
    if (error) {
      setErrorMsg(error.message);
    } else {
      alert('Profile updated successfully');
      fetchSocialData(); // in case username changed
    }
    setLoading(false);
  };

  /** Fetch follower/following counts and lists */
  const fetchSocialData = async () => {
    // 1) Get all follower IDs
    let { data: followerRows, error: fErr } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('followed_id', user.id);
    if (fErr) {
      console.error('Error fetching followers:', fErr);
      return;
    }
    const followerIds = followerRows.map((r) => r.follower_id);
    setFollowersCount(followerIds.length);

    // 2) Get all following IDs
    let { data: followingRows, error: gErr } = await supabase
      .from('follows')
      .select('followed_id')
      .eq('follower_id', user.id);
    if (gErr) {
      console.error('Error fetching following:', gErr);
      return;
    }
    const followingIds = followingRows.map((r) => r.followed_id);
    setFollowingCount(followingIds.length);

    // 3) Fetch user_metadata for followerIds
    if (followerIds.length > 0) {
      let { data: followerUsers, error: fuErr } = await supabase
        .from('users')
        .select('id, user_metadata')
        .in('id', followerIds);
      if (!fuErr) {
        setFollowersList(
          followerUsers.map((u) => {
            const name = u.user_metadata?.username ||
                         u.email.substring(0, u.email.indexOf('@'));
            return {
              id:          u.id,
              username:    name,
              avatar_url:  u.user_metadata?.avatar_url || null,
            };
          })
        );
      }
    } else {
      setFollowersList([]);
    }

    // 4) Fetch user_metadata for followingIds
    if (followingIds.length > 0) {
      let { data: followingUsers, error: foErr } = await supabase
        .from('users')
        .select('id, user_metadata')
        .in('id', followingIds);
      if (!foErr) {
        setFollowingList(
          followingUsers.map((u) => {
            const name = u.user_metadata?.username ||
                         u.email.substring(0, u.email.indexOf('@'));
            return {
              id:          u.id,
              username:    name,
              avatar_url:  u.user_metadata?.avatar_url || null,
            };
          })
        );
      }
    } else {
      setFollowingList([]);
    }
  };

  if (loading) {
    return <div className="loading-screen">Loading…</div>;
  }

  return (
    <div className="profile-page" style={{ width: '100%', padding: '2rem' }}>
      <div
        className="card profile-form"
        style={{
          width:          '100%',
          maxWidth:       '800px',
          margin:         '0 auto',
          padding:        '2rem',
          display:        'grid',
          gridTemplateColumns: '1fr 2fr',
          gridGap:        '1.5rem',
          alignItems:     'start',
        }}
      >
        {/* Section Title */}
        <div style={{ gridColumn: '1 / -1', marginBottom: '1rem', textAlign: 'center' }}>
          <h2>Your Profile</h2>
          <p style={{ color: 'var(--color-text-light)' }}>
            @{username || '<no username set>'}
          </p>
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
          {/* Username Input */}
          <div className="form-group">
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
              Username
            </label>
            <input
              type="text"
              className="input-text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a unique username"
            />
            <small style={{ color: 'var(--color-text-light)', fontSize: '0.85rem' }}>
              Will appear publicly (forum, comments, followers).
            </small>
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

          {/* Account Email (read-only) */}
          <div className="form-group">
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.5rem' }}>
              Account Email
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

          {/* Dark Mode Toggle */}
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

        {/* Social Section (below form fields, spanning entire width) */}
        <div style={{ gridColumn: '1 / -1', marginTop: '2rem' }}>
          <h3>Social</h3>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            {/* Followers */}
            <div>
              <strong>{followersCount}</strong> {followersCount === 1 ? 'Follower' : 'Followers'}
              {followersList.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {followersList.map((f) => (
                    <div key={f.id} style={{ textAlign: 'center' }}>
                      {f.avatar_url ? (
                        <img
                          src={f.avatar_url}
                          alt={`${f.username} avatar`}
                          style={{
                            width:        '32px',
                            height:       '32px',
                            objectFit:    'cover',
                            borderRadius: '50%',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width:          '32px',
                            height:         '32px',
                            backgroundColor:'#e2e8f0',
                            borderRadius:   '50%',
                          }}
                        />
                      )}
                      <div style={{ fontSize: '0.75rem' }}>@{f.username}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Following */}
            <div>
              <strong>{followingCount}</strong> {followingCount === 1 ? 'Following' : 'Following'}
              {followingList.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {followingList.map((f) => (
                    <div key={f.id} style={{ textAlign: 'center' }}>
                      {f.avatar_url ? (
                        <img
                          src={f.avatar_url}
                          alt={`${f.username} avatar`}
                          style={{
                            width:        '32px',
                            height:       '32px',
                            objectFit:    'cover',
                            borderRadius: '50%',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width:          '32px',
                            height:         '32px',
                            backgroundColor:'#e2e8f0',
                            borderRadius:   '50%',
                          }}
                        />
                      )}
                      <div style={{ fontSize: '0.75rem' }}>@{f.username}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
