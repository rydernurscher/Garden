// src/pages/Notifications.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../api/supabaseClient';
import '../styles/styles.css';

export default function Notifications({ session }) {
  const user = session.user;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    setErrorMsg('');

    const { data, error } = await supabase
      .from('notifications')
      .select(`
        id,
        actor_username,
        actor_avatar_url,
        type,
        post_id,
        comment_id,
        created_at
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      setErrorMsg('Error loading notifications.');
    } else {
      setNotifications(data);
    }
    setLoading(false);
  };

  // Helper: render notification text
  const renderText = (n) => {
    switch (n.type) {
      case 'like':
        return `@${n.actor_username} liked your post.`;
      case 'comment':
        return `@${n.actor_username} commented on your post.`;
      case 'follow':
        return `@${n.actor_username} started following you.`;
      default:
        return 'Unknown notification';
    }
  };

  // Format timestamp as DD/MM/YYYY hh:mm
  const formatTimestamp = (ts) => {
    const d = new Date(ts);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${mins}`;
  };

  return (
    <div className="notifications-page" style={{ padding: '1rem 0' }}>
      <h2>Inbox</h2>
      {errorMsg && <p className="error">{errorMsg}</p>}

      {loading ? (
        <p>Loading notifications…</p>
      ) : notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              className="card"
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem' }}
            >
              {/* Actor avatar */}
              {n.actor_avatar_url ? (
                <img
                  src={n.actor_avatar_url}
                  alt={`${n.actor_username} avatar`}
                  style={{
                    width:        '40px',
                    height:       '40px',
                    objectFit:    'cover',
                    borderRadius: '50%',
                  }}
                />
              ) : (
                <div
                  style={{
                    width:          '40px',
                    height:         '40px',
                    backgroundColor:'#e2e8f0',
                    borderRadius:   '50%',
                  }}
                />
              )}

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.95rem' }}>{renderText(n)}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                  {formatTimestamp(n.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
