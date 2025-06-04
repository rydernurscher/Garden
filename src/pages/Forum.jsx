// src/pages/Forum.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../api/supabaseClient';
import PostCard from '../components/PostCard';
import '../styles/styles.css';

export default function Forum({ session }) {
  const user = session.user;
  const [caption, setCaption]     = useState('');
  const [file, setFile]           = useState(null);
  const [posts, setPosts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [errorMsg, setErrorMsg]   = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  // 1) Fetch all posts (most recent first)
  const fetchPosts = async () => {
    setLoading(true);
    setErrorMsg('');
    const { data, error } = await supabase
      .from('posts')
      .select('id, user_id, image_url, caption, username, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      setErrorMsg('Error loading forum posts.');
    } else {
      setPosts(data);
    }
    setLoading(false);
  };

  // 2) Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // 3) Handle new post
  const handleCreatePost = async () => {
    if (!file || !caption.trim()) {
      setErrorMsg('Please select a photo and write a caption.');
      return;
    }

    setUploading(true);
    setErrorMsg('');

    // Build a path: userID/postID/filename
    const postId = Date.now().toString(); // temporary local ID for file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${postId}.${fileExt}`;
    const filePath = `${user.id}/${postId}/${fileName}`;

    // 3.a) Upload image to "community-photos" bucket
    const { error: uploadError } = await supabase.storage
      .from('community-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert:       true,
      });

    if (uploadError) {
      setErrorMsg('Error uploading image.');
      setUploading(false);
      return;
    }

    // 3.b) Get public URL
    const { data: publicData } = supabase.storage
      .from('community-photos')
      .getPublicUrl(filePath);

    const publicUrl = publicData.publicUrl;

    // 3.c) Insert into posts table
    // Use user_metadata.full_name if set, otherwise email prefix
    const username =
      user.user_metadata?.full_name ||
      user.email.substring(0, user.email.indexOf('@'));

    const { error: insertError } = await supabase
      .from('posts')
      .insert([
        {
          user_id:   user.id,
          image_url: publicUrl,
          caption:   caption.trim(),
          username,
        },
      ]);

    if (insertError) {
      setErrorMsg('Error creating post.');
      setUploading(false);
      return;
    }

    // 3.d) Clear inputs and reload posts
    setCaption('');
    setFile(null);
    fetchPosts();
    setUploading(false);
  };

  return (
    <div className="forum-page" style={{ padding: '1rem 0' }}>
      <h2>Community Forum</h2>
      {errorMsg && <p className="error">{errorMsg}</p>}

      {/* ===== Create Post Form ===== */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ padding: '0.5rem 0' }}
          />
          <textarea
            className="input-text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
          />
          <button
            className="btn glow-btn"
            onClick={handleCreatePost}
            disabled={uploading}
          >
            {uploading ? 'Posting…' : 'Post to Forum'}
          </button>
        </div>
      </div>

      {/* ===== Posts Grid ===== */}
      {loading ? (
        <p>Loading posts…</p>
      ) : (
        <>
          {posts.length === 0 ? (
            <p>No posts yet. Be the first to share!</p>
          ) : (
            <div className="grid">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
