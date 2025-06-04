// src/components/CommentCard.jsx
import React from 'react';
import '../styles/styles.css';

export default function CommentCard({ comment }) {
  const { username, avatar_url, content, created_at } = comment;
  const formattedDate = new Date(created_at).toLocaleString();

  return (
    <div
      className="card"
      style={{
        display:       'flex',
        alignItems:    'center',
        gap:           '0.75rem',
        padding:       '0.5rem 1rem',
        marginBottom:  '0.5rem',
        backgroundColor: 'var(--color-card-bg)',
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
            backgroundColor: '#e2e8f0',
            borderRadius:   '50%',
          }}
        />
      )}

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.9rem' }}>
          <strong>@{username}</strong> <span style={{ color: 'var(--color-text-light)' }}>{formattedDate}</span>
        </div>
        <div style={{ marginTop: '0.25rem', fontSize: '0.9rem' }}>{content}</div>
      </div>
    </div>
  );
}
