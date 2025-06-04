// src/pages/Dashboard.jsx
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

  const usernameDisplay =
    user.user_metadata?.username ||
    user.email.substring(0, user.email.indexOf('@'));

  return (
    <div className="dashboard-page" style={{ maxWidth: '900px', margin: '0 auto', paddingTop: '1rem' }}>
      <h2>Welcome, @{usernameDisplay}!</h2>

      {errorMsg && <p className="error">{errorMsg}</p>}

      {/* … rest of Dashboard unchanged … */}
    </div>
  );
}
