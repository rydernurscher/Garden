// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../api/supabaseClient';
import '../styles/styles.css';

export default function Dashboard({ session }) {
  const user = session.user;
  const [plantCount, setPlantCount] = useState(0);
  const [taskCount, setTaskCount]   = useState(0);
  const [loading, setLoading]       = useState(true);
  const [errorMsg, setErrorMsg]     = useState('');

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    setLoading(true);

    // 1) Fetch plant count for this user
    const { count: plantTotal, error: plantError } = await supabase
      .from('plants')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (plantError) {
      setErrorMsg('Error loading plants.');
    } else {
      setPlantCount(plantTotal || 0);
    }

    // 2) Fetch task count for this user
    const { count: taskTotal, error: taskError } = await supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (taskError) {
      setErrorMsg('Error loading tasks.');
    } else {
      setTaskCount(taskTotal || 0);
    }

    setLoading(false);
  };

  return (
    <div className="dashboard-page">
      <h2>Dashboard</h2>

      {errorMsg && <p className="error">{errorMsg}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="dashboard-stats">
          <div className="stat-card card">
            <h3>My Library Size</h3>
            <p>
              {plantCount} plant{plantCount !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="stat-card card">
            <h3>My Task Count</h3>
            <p>
              {taskCount} task{taskCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
