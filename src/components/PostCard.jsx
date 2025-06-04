// src/components/PostCard.jsx
import React from 'react';
import '../styles/styles.css';

export default function PostCard({ post }) {
  const formattedDate = new Date(post.created_at).toLocaleString();

  return (
    <div className="card post-card" style={{ display: 'flex', flexDirection: 'column', padding: '0' }}>
      {/* Image */}
      <img
        src={post.image_url}
        alt={post.caption}
        style={{
          width:  '100%',
          height: '180px',
          objectFit: 'cover',
          borderRadius: '8px 8px 0 0',
        }}
      />

      {/* Caption & Info */}
      <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--color-card-bg)' }}>
        <p style={{ marginBottom: '0.5rem', fontSize: '0.95rem', color: 'var(--color-text)' }}>
          {post.caption}
        </p>
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
          Posted by <strong>{post.username}</strong> on {formattedDate}
        </div>
      </div>
    </div>
  );
}
