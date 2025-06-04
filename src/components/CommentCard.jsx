// src/components/CommentCard.jsx
import React from 'react';
import '../styles/styles.css';

export default function CommentCard({ comment }) {
  const { username, avatar_url, content, created_at } = comment;

  // Format timestamp as DD/MM/YYYY hh:mm
  const d = new Date(created_at);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  const formatted = `${day}/${month}/${year} ${hours}:${mins}`;

  return (
    <div
      className="card"
      style={{
        display:        'flex',
        alignItems:     'center',
        gap:            '0.75rem',
        padding:        '0.5rem 1rem',
        marginBottom:   '0.5rem',
        backgroundColor:'var(--color-card-bg)',
      }}
    >
      {/* Avatar */}
      {avatar_url ? (
        <img
          src={avatar_url}
          alt={`${username} avatar`}
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

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.9rem' }}>
          <strong>@{username}</strong>{' '}
          <span style={{ color: 'var(--color-text-light)', fontSize: '0.8rem' }}>
            {formatted}
          </span>
        </div>
        <div style={{ marginTop: '0.25rem', fontSize: '0.9rem' }}>{content}</div>
      </div>
    </div>
  );
}
