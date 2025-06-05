// src/pages/OtherUserProfile.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../api/supabaseClient';
import '../styles/styles.css';

export default function OtherUserProfile({ session }) {
  const { userId } = useParams();
  const [userData, setUserData]       = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersList, setFollowersList]   = useState([]);
  const [followingList, setFollowingList]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [errorMsg, setErrorMsg]       = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);

      // 1) Fetch basic user info from "users" table
      const { data: userRows, error: userErr } = await supabase
        .from('users')
        .select('id, user_metadata, email')
        .eq('id', userId)
        .single();

      if (userErr || !userRows) {
        setErrorMsg('Failed to load user profile.');
        setLoading(false);
        return;
      }
      const metadata = userRows.user_metadata || {};
      setUserData({
        id:          userRows.id,
        username:    metadata.username || userRows.email.split('@')[0],
        fullName:    metadata.full_name || '',
        avatarUrl:   metadata.avatar_url || null,
        email:       userRows.email,
      });

      // 2) Fetch follower IDs (who follows this user)
      const { data: followerRows, error: fErr } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('followed_id', userId);

      if (!fErr && followerRows) {
        const followerIds = followerRows.map(r => r.follower_id);
        setFollowersCount(followerIds.length);

        if (followerIds.length > 0) {
          const { data: followerUsers, error: fuErr } = await supabase
            .from('users')
            .select('id, user_metadata, email')
            .in('id', followerIds);

          if (!fuErr && followerUsers) {
            setFollowersList(
              followerUsers.map(u => {
                const name = u.user_metadata?.username ||
                             u.email.split('@')[0];
                return {
                  id:         u.id,
                  username:   name,
                  avatar_url: u.user_metadata?.avatar_url || null,
                };
              })
            );
          }
        }
      }

      // 3) Fetch following IDs (who this user is following)
      const { data: followingRows, error: gErr } = await supabase
        .from('follows')
        .select('followed_id')
        .eq('follower_id', userId);

      if (!gErr && followingRows) {
        const followingIds = followingRows.map(r => r.followed_id);
        setFollowingCount(followingIds.length);

        if (followingIds.length > 0) {
          const { data: followingUsers, error: foErr } = await supabase
            .from('users')
            .select('id, user_metadata, email')
            .in('id', followingIds);

          if (!foErr && followingUsers) {
            setFollowingList(
              followingUsers.map(u => {
                const name = u.user_metadata?.username ||
                             u.email.split('@')[0];
                return {
                  id:         u.id,
                  username:   name,
                  avatar_url: u.user_metadata?.avatar_url || null,
                };
              })
            );
          }
        }
      }

      setLoading(false);
    };

    fetchUserProfile();
  }, [userId]);

  if (loading) {
    return <div className="loading-screen">Loading user profile…</div>;
  }

  if (errorMsg) {
    return (
      <div className="container">
        <p className="error">{errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div
        className="card"
        style={{
          maxWidth: '800px',
          margin:    '0 auto',
          padding:   '2rem',
          display:   'grid',
          gridTemplateColumns: '1fr 2fr',
          gridGap:   '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* Section Title */}
        <div style={{ gridColumn: '1 / -1', marginBottom: '1rem', textAlign: 'center' }}>
          <h2>User Profile</h2>
          <p style={{ color: 'var(--color-text-light)' }}>@{userData.username}</p>
        </div>

        {/* Avatar */}
        <div style={{ textAlign: 'center' }}>
          {userData.avatarUrl ? (
            <img
              src={userData.avatarUrl}
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
                width:          '150px',
                height:         '150px',
                backgroundColor:'#e2e8f0',
                borderRadius:   '50%',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                color:          'var(--color-placeholder)',
                fontSize:       '1.2rem',
                border:         '3px solid var(--color-input-border)',
              }}
            >
              No Avatar
            </div>
          )}
        </div>

        {/* Basic Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gridRowGap: '1.25rem' }}>
          <div>
            <label style={{ fontWeight: '500' }}>Username</label>
            <p style={{ marginTop: '0.25rem' }}>@{userData.username}</p>
          </div>
          {userData.fullName && (
            <div>
              <label style={{ fontWeight: '500' }}>Full Name</label>
              <p style={{ marginTop: '0.25rem' }}>{userData.fullName}</p>
            </div>
          )}
          <div>
            <label style={{ fontWeight: '500' }}>Email</label>
            <p style={{ marginTop: '0.25rem' }}>{userData.email}</p>
          </div>
        </div>

        {/* Social Section */}
        <div style={{ gridColumn: '1 / -1', marginTop: '2rem' }} className="social-section">
          <h3>Connections</h3>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {/* Followers */}
            <div>
              <strong>{followersCount}</strong>{' '}
              {followersCount === 1 ? 'Follower' : 'Followers'}
              {followersList.length > 0 && (
                <div className="social-list">
                  {followersList.map((f) => (
                    <div key={f.id} className="social-item">
                      <Link to={`/profile/${f.id}`}>
                        {f.avatar_url ? (
                          <img src={f.avatar_url} alt={`${f.username} avatar`} />
                        ) : (
                          <div
                            style={{
                              width:          '48px',
                              height:         '48px',
                              backgroundColor:'#e2e8f0',
                              borderRadius:   '50%',
                            }}
                          />
                        )}
                      </Link>
                      <span>@{f.username}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Following */}
            <div>
              <strong>{followingCount}</strong>{' '}
              {followingCount === 1 ? 'Following' : 'Following'}
              {followingList.length > 0 && (
                <div className="social-list">
                  {followingList.map((f) => (
                    <div key={f.id} className="social-item">
                      <Link to={`/profile/${f.id}`}>
                        {f.avatar_url ? (
                          <img src={f.avatar_url} alt={`${f.username} avatar`} />
                        ) : (
                          <div
                            style={{
                              width:          '48px',
                              height:         '48px',
                              backgroundColor:'#e2e8f0',
                              borderRadius:   '50%',
                            }}
                          />
                        )}
                      </Link>
                      <span>@{f.username}</span>
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
