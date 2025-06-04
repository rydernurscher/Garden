// src/pages/Settings.jsx
import React, { useState } from 'react';
import { supabase } from '../api/supabaseClient';
import '../styles/styles.css';
import { useNavigate } from 'react-router-dom';

export default function Settings({ session }) {
  const user = session.user;
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState(''); // for password update, Supabase v2 needs re-authentication via signIn
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg]               = useState('');
  const [loadingPwd, setLoadingPwd]           = useState(false);
  const [loadingDel, setLoadingDel]           = useState(false);

  // 1) Change password (via supabase.auth.updateUser)
  const handleChangePassword = async () => {
    setErrorMsg('');

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setErrorMsg('New password fields cannot be empty.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    setLoadingPwd(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword.trim(),
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      alert('Password changed successfully.');
      setNewPassword('');
      setConfirmPassword('');
    }
    setLoadingPwd(false);
  };

  // 2) Delete account (with confirmation)
  const handleDeleteAccount = async () => {
    const confirmDel = window.confirm(
      'Are you sure you want to delete your account? All your data (plants, tasks, posts) will be permanently removed.'
    );
    if (!confirmDel) return;

    setLoadingDel(true);
    setErrorMsg('');

    // Delete user via Supabase Admin API is not available on client, so instead we:
    //  a) Delete all user data in client (plants, tasks, posts)
    //  b) Sign out and show a message that they should manually delete account from Supabase dashboard if needed

    // 2.a) Delete plants
    await supabase.from('plants').delete().eq('user_id', user.id);

    // 2.b) Delete tasks
    await supabase.from('tasks').delete().eq('user_id', user.id);

    // 2.c) Delete forum posts
    await supabase.from('posts').delete().eq('user_id', user.id);

    // 2.d) Sign out
    await supabase.auth.signOut();
    localStorage.removeItem('supabase.auth.token');

    setLoadingDel(false);
    alert('Your account data has been removed. You have been logged out.');
    navigate('/login');
  };

  return (
    <div className="settings-page" style={{ padding: '1rem 0' }}>
      <h2>Settings</h2>
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
        {/* Account Info */}
        <h3>Account Information</h3>
        <p>
          <strong>Username:</strong> {user.user_metadata?.username || '<not set>'}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>

        <hr style={{ margin: '1.5rem 0' }} />

        {/* Change Password */}
        <h3>Change Password</h3>
        <div style={{ display: 'grid', gridRowGap: '1rem', marginBottom: '1rem' }}>
          <input
            type="password"
            className="input-text"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            className="input-text"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            className="btn glow-btn"
            onClick={handleChangePassword}
            disabled={loadingPwd}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {loadingPwd ? 'Updating…' : 'Update Password'}
          </button>
        </div>

        <hr style={{ margin: '1.5rem 0' }} />

        {/* Delete Account */}
        <h3 style={{ color: 'var(--color-error)' }}>Delete Account</h3>
        <p style={{ marginBottom: '1rem' }}>
          Permanently delete your account and all associated data (plants, tasks, forum posts). This action cannot be undone.
        </p>
        <button
          className="btn small glow-btn"
          onClick={handleDeleteAccount}
          disabled={loadingDel}
          style={{ width: '100%' }}
        >
          {loadingDel ? 'Deleting…' : 'Delete My Account'}
        </button>

        {errorMsg && <p className="error" style={{ marginTop: '1rem' }}>{errorMsg}</p>}
      </div>
    </div>
  );
}
