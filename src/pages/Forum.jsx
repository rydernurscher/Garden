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

  /** 1) Fetch all posts (including likeCount, commentCount, and whether current user liked/followed) */
  const fetchPosts = async () => {
    setLoading(true);
    setErrorMsg('');

    // 1.a) Fetch basic post data (including avatar_url and username)
    const { data: basePosts, error: postsError } = await supabase
      .from('posts')
      .select(`
        id,
        user_id,
        username,
        avatar_url,
        image_url,
        caption,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (postsError) {
      setErrorMsg('Error loading forum posts.');
      setLoading(false);
      return;
    }

    // 1.b) For each post, fetch like count, comment count, and whether current user liked it
    //      Also fetch whether current user follows this post’s author.
    const enrichedPosts = await Promise.all(
      basePosts.map(async (post) => {
        // Fetch total likes
        const { count: likeCount } = await supabase
          .from('likes')
          .select('id', { count: 'exact', head: true })
          .eq('post_id', post.id);

        // Check if current user has liked
        const { data: existingLike } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', post.id)
          .eq('user_id', user.id)
          .single();

        // Fetch total comments
        const { count: commentCount } = await supabase
          .from('comments')
          .select('id', { count: 'exact', head: true })
          .eq('post_id', post.id);

        // Check if current user follows this post’s author
        const { data: existingFollow } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('followed_id', post.user_id)
          .single();

        return {
          ...post,
          likeCount:    likeCount || 0,
          hasLiked:     existingLike ? true : false,
          commentCount: commentCount || 0,
          isFollowing:  existingFollow ? true : false,
        };
      })
    );

    setPosts(enrichedPosts);
    setLoading(false);
  };

  /** 2) Handle file selection */
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  /** 3) Handle new post (with optional image) */
  const handleCreatePost = async () => {
    if (!caption.trim() && !file) {
      setErrorMsg('Please write a caption or select a photo.');
      return;
    }

    setUploading(true);
    setErrorMsg('');

    let publicUrl = null;

    // 3.a) If a file is provided, upload it
    if (file) {
      // Verify bucket exists
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      if (bucketError) {
        setErrorMsg('Unable to list storage buckets.');
        setUploading(false);
        return;
      }
      const names = buckets.map((b) => b.name);
      if (!names.includes('community-photos')) {
        setErrorMsg('Storage bucket "community-photos" not found.');
        setUploading(false);
        return;
      }

      // Create a path and upload
      const postIdTemp = Date.now().toString();
      const fileExt    = file.name.split('.').pop();
      const fileName   = `${postIdTemp}.${fileExt}`;
      const filePath   = `${user.id}/${postIdTemp}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('community-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert:       true,
        });
      if (uploadError) {
        setErrorMsg(`Upload error: ${uploadError.message}`);
        setUploading(false);
        return;
      }

      const { data: publicData, error: publicError } = supabase.storage
        .from('community-photos')
        .getPublicUrl(filePath);
      if (publicError) {
        setErrorMsg('Error retrieving public URL.');
        setUploading(false);
        return;
      }
      publicUrl = publicData.publicUrl;
    }

    // 3.b) Insert into posts (image_url may be null)
    const username = user.user_metadata?.username
      || user.email.substring(0, user.email.indexOf('@'));
    const avatar_url = user.user_metadata?.avatar_url || null;

    const { error: insertError } = await supabase
      .from('posts')
      .insert([
        {
          user_id:    user.id,
          username,
          avatar_url,
          image_url:  publicUrl,
          caption:    caption.trim(),
        },
      ]);

    if (insertError) {
      setErrorMsg(`Error creating post: ${insertError.message}`);
      setUploading(false);
      return;
    }

    // 3.c) Clear inputs and refresh
    setCaption('');
    setFile(null);
    fetchPosts();
    setUploading(false);
  };

  return (
    <div className="forum-page" style={{ padding: '1rem 0' }}>
      <h2>Community Forum</h2>

      {errorMsg && (
        <p className="error" style={{ marginBottom: '1rem' }}>
          {errorMsg}
        </p>
      )}

      {/* ===== Create Post Form ===== */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <textarea
            className="input-text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            style={{ resize: 'vertical' }}
          />
          <label style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>
            (Optional) Upload a photo:
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ marginTop: '0.25rem' }}
            />
          </label>
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
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={user}
                  refreshPosts={fetchPosts}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
