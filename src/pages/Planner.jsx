import React, { useEffect, useState } from 'react';
import TaskCard from '../components/TaskCard';
import { supabase } from '../api/supabaseClient';
import '../styles/styles.css';

export default function Planner({ session }) {
  const user = session.user;
  const [myPlants, setMyPlants] = useState([]);
  const [tasks, setTasks]       = useState([]);
  const [formData, setFormData] = useState({
    plantId:  '',
    taskType: '',
    dueDate:  '',
  });
  const [loading, setLoading]   = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const taskTypes = ['Water', 'Prune', 'Fertilize', 'Harvest', 'Other'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');

    // Fetch plants
    const { data: plantsData, error: plantsError } = await supabase
      .from('plants')
      .select('id, common_name')
      .eq('user_id', user.id);

    if (plantsError) setErrorMsg('Error loading plants for tasks.');
    else setMyPlants(plantsData || []);

    // Fetch tasks
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('id, plant_id, plant_name, task_type, due_date')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true });

    if (tasksError) setErrorMsg('Error loading tasks.');
    else setTasks(tasksData || []);

    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreateTask = async () => {
    const { plantId, taskType, dueDate } = formData;
    if (!taskType || !dueDate) return;

    setLoading(true);
    setErrorMsg('');

    let plantName = '';
    if (plantId) {
      const found = myPlants.find((p) => p.id === plantId);
      plantName = found ? found.common_name : '';
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          user_id:    user.id,
          plant_id:   plantId || null,
          plant_name: plantName,
          task_type:  taskType,
          due_date:   dueDate,
        },
      ])
      .select('id, plant_id, plant_name, task_type, due_date');

    if (error) {
      setErrorMsg('Error creating task.');
    } else {
      setTasks([data[0], ...tasks]);
      setFormData({ plantId: '', taskType: '', dueDate: '' });
    }

    setLoading(false);
  };

  const handleDeleteTask = async (taskId) => {
    const confirmDel = window.confirm('Delete this task?');
    if (!confirmDel) return;

    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      setErrorMsg('Error deleting task.');
    } else {
      setTasks(tasks.filter((t) => t.id !== taskId));
    }

    setLoading(false);
  };

  return (
    <div className="planner-page" style={{ padding: '1rem 0' }}>
      <h2>Planner</h2>
      {errorMsg && <p className="error">{errorMsg}</p>}

      {/* ===== Add Task Form ===== */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            name="plantId"
            value={formData.plantId}
            onChange={handleChange}
            className="input-select"
            style={{ flex: 1, minWidth: '160px' }}
          >
            <option value="">Attach to Plant (optional)</option>
            {myPlants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.common_name}
              </option>
            ))}
          </select>

          <select
            name="taskType"
            value={formData.taskType}
            onChange={handleChange}
            className="input-select"
            style={{ flex: 1, minWidth: '140px' }}
          >
            <option value="">Select a task</option>
            {taskTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="input-text"
            style={{ flex: 1, minWidth: '140px' }}
          />

          <button
            className="btn glow-btn"
            onClick={handleCreateTask}
            disabled={loading}
          >
            {loading ? 'Creating…' : 'Create Task'}
          </button>
        </div>
      </div>

      {loading && <p>Loading…</p>}

      {/* ===== Task List ===== */}
      {!loading && (
        <>
          {tasks.length === 0 ? (
            <p>No tasks created yet.</p>
          ) : (
            <div className="tasks-container">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDelete={() => handleDeleteTask(task.id)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
