// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../api/supabaseClient';
import '../styles/styles.css';
import { Link } from 'react-router-dom';

export default function Dashboard({ session }) {
  const user = session.user;
  const [plantCount, setPlantCount]       = useState(0);
  const [taskCount, setTaskCount]         = useState(0);
  const [recentPlants, setRecentPlants]   = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [errorMsg, setErrorMsg]           = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setErrorMsg('');

    // 1) Fetch total plant count
    const { count: plantTotal, error: plantError } = await supabase
      .from('plants')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (plantError) {
      setErrorMsg('Error loading plant count.');
    } else {
      setPlantCount(plantTotal || 0);
    }

    // 2) Fetch total task count
    const { count: taskTotal, error: taskError } = await supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (taskError) {
      setErrorMsg('Error loading task count.');
    } else {
      setTaskCount(taskTotal || 0);
    }

    // 3) Fetch 3 most-recent plants
    const { data: plantsData, error: plantsFetchError } = await supabase
      .from('plants')
      .select('id, common_name, image_url')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3);

    if (plantsFetchError) {
      setErrorMsg('Error loading recent plants.');
    } else {
      setRecentPlants(plantsData || []);
    }

    // 4) Fetch 3 upcoming tasks (due_date >= today)
    const today = new Date().toISOString().slice(0, 10);
    const { data: tasksData, error: tasksFetchError } = await supabase
      .from('tasks')
      .select('id, plant_name, task_type, due_date')
      .eq('user_id', user.id)
      .gte('due_date', today)
      .order('due_date', { ascending: true })
      .limit(3);

    if (tasksFetchError) {
      setErrorMsg('Error loading upcoming tasks.');
    } else {
      setUpcomingTasks(tasksData || []);
    }

    setLoading(false);
  };

  const greetingName = user.user_metadata?.full_name || user.email.split('@')[0];

  return (
    <div className="dashboard-page" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1rem', color: '#2d3748' }}>
        Welcome, {greetingName}!
      </h2>

      {errorMsg && <p className="error" style={{ marginBottom: '1rem' }}>{errorMsg}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          {/* ===== Top Stat Cards ===== */}
          <div className="dashboard-stats" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <div className="stat-card card" style={{ flex: 1, padding: '1rem', textAlign: 'center' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>Plants in Library</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: '500' }}>
                {plantCount} {plantCount === 1 ? 'Plant' : 'Plants'}
              </p>
              <Link to="/library">
                <button className="btn glow-btn" style={{ marginTop: '0.5rem' }}>
                  View Library
                </button>
              </Link>
            </div>

            <div className="stat-card card" style={{ flex: 1, padding: '1rem', textAlign: 'center' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>Total Tasks</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: '500' }}>
                {taskCount} {taskCount === 1 ? 'Task' : 'Tasks'}
              </p>
              <Link to="/planner">
                <button className="btn glow-btn" style={{ marginTop: '0.5rem' }}>
                  View Planner
                </button>
              </Link>
            </div>
          </div>

          {/* ===== Recent Plants Section ===== */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '0.75rem', color: '#2d3748' }}>Recently Added Plants</h3>
            {recentPlants.length === 0 ? (
              <p>No plants yet. <Link to="/library" style={{ color: '#3182ce' }}>Add one now.</Link></p>
            ) : (
              <div className="grid" style={{ gap: '1rem' }}>
                {recentPlants.map((p) => (
                  <div
                    key={p.id}
                    className="card"
                    style={{
                      flex:           '1 1 0',
                      maxWidth:       '200px',
                      display:        'flex',
                      flexDirection:  'column',
                      overflow:       'hidden',
                    }}
                  >
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.common_name}
                        style={{
                          width:       '100%',
                          height:      '120px',
                          objectFit:   'cover',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width:         '100%',
                          height:        '120px',
                          background:    '#e2e8f0',
                          display:       'flex',
                          alignItems:    'center',
                          justifyContent:'center',
                          color:         '#718096',
                          fontSize:      '0.9rem',
                        }}
                      >
                        No Photo
                      </div>
                    )}
                    <div style={{ padding: '0.5rem', textAlign: 'center', fontWeight: '500' }}>
                      {p.common_name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ===== Upcoming Tasks Section ===== */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '0.75rem', color: '#2d3748' }}>Upcoming Tasks</h3>
            {upcomingTasks.length === 0 ? (
              <p>No upcoming tasks. <Link to="/planner" style={{ color: '#3182ce' }}>Create one.</Link></p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {upcomingTasks.map((t) => (
                  <div
                    key={t.id}
                    className="card"
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem' }}
                  >
                    <div>
                      <strong style={{ display: 'block', marginBottom: '0.25rem' }}>{t.task_type}</strong>
                      <span style={{ fontSize: '0.9rem', color: '#4a5568' }}>
                        {t.plant_name ? `For: ${t.plant_name}` : 'General'}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        Due: {t.due_date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ===== Quick Links ===== */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <Link to="/library">
              <button className="btn glow-btn" style={{ flex: 1 }}>
                Manage Plants
              </button>
            </Link>
            <Link to="/planner">
              <button className="btn glow-btn" style={{ flex: 1 }}>
                Manage Tasks
              </button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
