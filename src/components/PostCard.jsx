// src/components/PostCard.jsx
import React, { useState } from 'react';
import '../styles/styles.css';
import CommentCard from './CommentCard';
import { supabase } from '../api/supabaseClient';

export default function PostCard({ post, currentUser, refreshPosts }) {
  const {
    id,
    user_id,
    username,
    avatar_url,
    image_url,
    caption,
    created_at,
    likeCount,
    hasLiked,
    commentCount,
    isFollowing,
  } = post;

  const [showComments, setShowComments] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [comments, setComments] = useState([]); // loaded when expanded

  /** 1) Format timestamp to DD/MM/YYYY hh:mm */
  const formatTimestamp = (ts) => {
    const d = new Date(ts);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${mins}`;
  };

  /** 2) Toggle Like/Unlike & create notification if liking */
  const toggleLike = async () => {
    if (hasLiked) {
      // Remove existing like
      await supabase
        .from('likes')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('post_id', id);
    } else {
      // Insert new like
      await supabase.from('likes').insert([
        {
          user_id: currentUser.id,
          post_id: id,
        },
      ]);
      // Create a notification for the post author (if they’re not liking their own post)
      if (user_id !== currentUser.id) {
        const actorName = currentUser.user_metadata?.username ||
                          currentUser.email.split('@')[0];
        const actorAvatar = currentUser.user_metadata?.avatar_url || null;
        await supabase.from('notifications').insert([
          {
            user_id:          user_id,          // who receives
            actor_id:         currentUser.id,
            actor_username:   actorName,
            actor_avatar_url: actorAvatar,
            type:             'like',
            post_id:          id,
          },
        ]);
      }
    }
    refreshPosts();
  };

  /** 3) Toggle Follow/Unfollow & create notification if following */
  const toggleFollow = async () => {
    if (isFollowing) {
      // Unfollow
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUser.id)
        .eq('followed_id', user_id);
    } else {
      // Follow
      await supabase.from('follows').insert([
        {
          follower_id: currentUser.id,
          followed_id: user_id,
        },
      ]);
      // Create notification for the user being followed
      if (user_id !== currentUser.id) {
        const actorName = currentUser.user_metadata?.username ||
                          currentUser.email.split('@')[0];
        const actorAvatar = currentUser.user_metadata?.avatar_url || null;
        await supabase.from('notifications').insert([
          {
            user_id:          user_id,
            actor_id:         currentUser.id,
            actor_username:   actorName,
            actor_avatar_url: actorAvatar,
            type:             'follow',
          },
        ]);
      }
    }
    refreshPosts();
  };

  /** 4) Load comments for this post */
  const loadComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('id, user_id, username, avatar_url, content, created_at')
      .eq('post_id', id)
      .order('created_at', { ascending: true });
    if (!error) setComments(data);
  };

  /** 5) Add a new comment & create notification */
  const handleAddComment = async () => {
    if (!commentContent.trim()) return;
    setSubmitting(true);

    const commenterName = currentUser.user_metadata?.username ||
                          currentUser.email.split('@')[0];
    const commenterAvatar = currentUser.user_metadata?.avatar_url || null;

    // 5.a) Insert comment
    const { data: newComment, error: insertError } = await supabase
      .from('comments')
      .insert([
        {
          post_id:    id,
          user_id:    currentUser.id,
          username:   commenterName,
          avatar_url: commenterAvatar,
          content:    commentContent.trim(),
        },
      ])
      .select('id')
      .single();

    if (!insertError && newComment) {
      // 5.b) Create notification for the post author
      if (user_id !== currentUser.id) {
        await supabase.from('notifications').insert([
          {
            user_id:          user_id,
            actor_id:         currentUser.id,
            actor_username:   commenterName,
            actor_avatar_url: commenterAvatar,
            type:             'comment',
            post_id:          id,
            comment_id:       newComment.id,
          },
        ]);
      }
    }

    setCommentContent('');
    loadComments();
    refreshPosts();
    setSubmitting(false);
  };

  return (
    <div className="card post-card" style={{ display: 'flex', flexDirection: 'column', padding: '0' }}>
      {/* Author Info */}
      <div
        style={{
          display:        'flex',
          alignItems:     'center',
          padding:        '0.75rem 1rem',
          backgroundColor:'var(--color-card-bg)',
          borderBottom:  '1px solid var(--color-input-border)',
        }}
      >
        {/* Avatar */}
        {avatar_url ? (
          <img
            src={avatar_url}
            alt={`${username} avatar`}
            style={{
              width:        '40px',
              height:       '40px',
              objectFit:    'cover',
              borderRadius: '50%',
              marginRight:  '0.75rem',
            }}
          />
        ) : (
          <div
            style={{
              width:          '40px',
              height:         '40px',
              backgroundColor:'#e2e8f0',
              borderRadius:   '50%',
              marginRight:    '0.75rem',
            }}
          />
        )}
        <div style={{ flex: 1 }}>
          <strong>@{username}</strong>
          <br />
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
            {formatTimestamp(created_at)}
          </span>
        </div>

        {/* Follow/Unfollow (if not your own post) */}
        {user_id !== currentUser.id && (
          <button
            className="btn small glow-btn"
            onClick={toggleFollow}
            style={{
              marginLeft:       'auto',
              backgroundColor:  isFollowing ? '#a9a9a9' : 'var(--color-primary)',
            }}
          >
            {isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        )}
      </div>

      {/* Optional Post Image */}
      {image_url && (
        <img
          src={image_url}
          alt={caption}
          style={{
            width:          '100%',
            height:         '240px',
            objectFit:      'cover',
          }}
        />
      )}

      {/* Caption & Actions */}
      <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--color-card-bg)' }}>
        <p style={{ marginBottom: '0.75rem' }}>{caption}</p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Like / Unlike */}
          <button
            className="btn small glow-btn"
            onClick={toggleLike}
            style={{
              backgroundColor: hasLiked ? '#993333' : 'var(--color-primary)',
            }}
          >
            {hasLiked ? 'Unlike' : 'Like'} ({likeCount})
          </button>

          {/* Toggle Comments */}
          <button
            className="btn small glow-btn"
            onClick={() => {
              setShowComments((prev) => !prev);
              if (!showComments) loadComments();
            }}
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Comments ({commentCount})
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div style={{ backgroundColor: 'var(--color-card-bg)', padding: '0.75rem 1rem' }}>
          {/* Existing Comments */}
          {comments.map((c) => (
            <CommentCard key={c.id} comment={c} />
          ))}

          {/* Add New Comment */}
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="input-text"
              placeholder="Write a comment..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              style={{ flex: 1 }}
            />
            <button
              className="btn small glow-btn"
              onClick={handleAddComment}
              disabled={submitting}
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {submitting ? 'Posting…' : 'Post'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Helper for timestamps */
function formatTimestamp(ts) {
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${mins}`;
}
