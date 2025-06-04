import React, { useEffect, useState } from 'react';
import { supabase } from '../api/supabaseClient';
import { Link } from 'react-router-dom';
import '../styles/styles.css';

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

    // 1) Plant Count
    const { count: plantTotal, error: plantError } = await supabase
      .from('plants')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (plantError) setErrorMsg('Error loading plant count.');
    else setPlantCount(plantTotal || 0);

    // 2) Task Count
    const { count: taskTotal, error: taskError } = await supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (taskError) setErrorMsg('Error loading task count.');
    else setTaskCount(taskTotal || 0);

    // 3) Most Recent 3 Plants
    const { data: plantsData, error: plantsFetchError } = await supabase
      .from('plants')
      .select('id, common_name, image_url')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3);

    if (plantsFetchError) setErrorMsg('Error loading recent plants.');
    else setRecentPlants(plantsData || []);

    // 4) Next 3 Upcoming Tasks
    const today = new Date().toISOString().slice(0, 10);
    const { data: tasksData, error: tasksFetchError } = await supabase
      .from('tasks')
      .select('id, plant_name, task_type, due_date')
      .eq('user_id', user.id)
      .gte('due_date', today)
      .order('due_date', { ascending: true })
      .limit(3);

    if (tasksFetchError) setErrorMsg('Error loading upcoming tasks.');
    else setUpcomingTasks(tasksData || []);

    setLoading(false);
  };

  const greetingName = user.user_metadata?.full_name || user.email.split('@')[0];

  return (
    <div className="dashboard-page" style={{ maxWidth: '900px', margin: '0 auto', paddingTop: '1rem' }}>
      <h2>Welcome, {greetingName}!</h2>

      {errorMsg && <p className="error">{errorMsg}</p>}

      {loading ? (
        <div className="loading-screen">Loading…</div>
      ) : (
        <>
          {/* ===== Top Stat Cards ===== */}
          <div className="dashboard-stats">
            <div className="stat-card card" style={{ textAlign: 'center', padding: '1.25rem' }}>
              <h3>Plants in Library</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: '500', margin: '0.5rem 0' }}>
                {plantCount} {plantCount === 1 ? 'Plant' : 'Plants'}
              </p>
              <Link to="/library">
                <button className="btn glow-btn" style={{ marginTop: '0.5rem' }}>
                  View Library
                </button>
              </Link>
            </div>

            <div className="stat-card card" style={{ textAlign: 'center', padding: '1.25rem' }}>
              <h3>Total Tasks</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: '500', margin: '0.5rem 0' }}>
                {taskCount} {taskCount === 1 ? 'Task' : 'Tasks'}
              </p>
              <Link to="/planner">
                <button className="btn glow-btn" style={{ marginTop: '0.5rem' }}>
                  View Planner
                </button>
              </Link>
            </div>
          </div>

          {/* ===== Recent Plants ===== */}
          <div style={{ marginBottom: '2rem' }}>
            <h3>Recently Added Plants</h3>
            {recentPlants.length === 0 ? (
              <p>
                No plants yet.{' '}
                <Link to="/library" style={{ color: 'var(--color-primary)' }}>
                  Add one now.
                </Link>
              </p>
            ) : (
              <div className="grid">
                {recentPlants.map((p) => (
                  <div
                    key={p.id}
                    className="card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                    }}
                  >
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.common_name}
                        style={{
                          width:  '100%',
                          height: '120px',
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
                          color:         'var(--color-placeholder)',
                          fontSize:      '0.9rem',
                        }}
                      >
                        No Photo
                      </div>
                    )}
                    <div
                      style={{
                        padding:      '0.75rem 1rem',
                        textAlign:    'center',
                        fontWeight:   '500',
                        flex:         1,
                        display:      'flex',
                        alignItems:   'center',
                        justifyContent:'center',
                      }}
                    >
                      {p.common_name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ===== Upcoming Tasks ===== */}
          <div style={{ marginBottom: '2rem' }}>
            <h3>Upcoming Tasks</h3>
            {upcomingTasks.length === 0 ? (
              <p>
                No upcoming tasks.{' '}
                <Link to="/planner" style={{ color: 'var(--color-primary)' }}>
                  Create one.
                </Link>
              </p>
            ) : (
              <div className="tasks-container">
                {upcomingTasks.map((t) => (
                  <div
                    key={t.id}
                    className="card task-card"
                    style={{
                      display:       'flex',
                      justifyContent:'space-between',
                      alignItems:    'center',
                      padding:       '0.75rem',
                    }}
                  >
                    <div>
                      <strong style={{ display: 'block', marginBottom: '0.25rem' }}>
                        {t.task_type}
                      </strong>
                      <span style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
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
          <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
            <Link to="/library" style={{ flex: 1 }}>
              <button className="btn glow-btn" style={{ width: '100%' }}>
                Manage Plants
              </button>
            </Link>
            <Link to="/planner" style={{ flex: 1 }}>
              <button className="btn glow-btn" style={{ width: '100%' }}>
                Manage Tasks
              </button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
