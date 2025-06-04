// src/pages/Planner.jsx
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
    dueDate:  ''
  });
  const [loading, setLoading]   = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const taskTypes = ['Water', 'Prune', 'Fertilize', 'Harvest', 'Other'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    // 1) Fetch plants
    const { data: plantsData, error: plantsError } = await supabase
      .from('plants')
      .select('*')
      .eq('user_id', user.id);

    if (plantsError) {
      setErrorMsg('Error loading plants for tasks');
    } else {
      setMyPlants(plantsData);
    }

    // 2) Fetch tasks
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true });

    if (tasksError) {
      setErrorMsg('Error loading tasks');
    } else {
      setTasks(tasksData);
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCreateTask = async () => {
    const { plantId, taskType, dueDate } = formData;
    if (!taskType || !dueDate) return;

    setLoading(true);

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
          due_date:   dueDate
        }
      ])
      .select();

    if (error) {
      setErrorMsg('Error creating task');
    } else {
      setTasks([data[0], ...tasks]);
      setFormData({
        plantId:  '',
        taskType: '',
        dueDate:  ''
      });
    }

    setLoading(false);
  };

  const handleDeleteTask = async (taskId) => {
    setLoading(true);
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      setErrorMsg('Error deleting task');
    } else {
      setTasks(tasks.filter((t) => t.id !== taskId));
    }
    setLoading(false);
  };

  return (
    <div className="planner-page">
      <h2>Planner</h2>
      {errorMsg && <p className="error">{errorMsg}</p>}

      <div className="add-task-form">
        <select
          name="plantId"
          value={formData.plantId}
          onChange={handleChange}
          className="input-select"
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
        />

        <button
          className="btn glow-btn"
          onClick={handleCreateTask}
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Task'}
        </button>
      </div>

      <h3>Upcoming Tasks:</h3>
      {loading && <p>Loading...</p>}
      {!loading && (
        <div className="tasks-container">
          {tasks.length === 0 ? (
            <p>No tasks created yet.</p>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={handleDeleteTask}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
