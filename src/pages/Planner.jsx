// src/pages/Planner.jsx
import React, { useEffect, useState } from 'react';
import TaskCard from '../components/TaskCard';

export default function Planner({ session }) {
  const [myPlants, setMyPlants]   = useState([]);
  const [tasks, setTasks]         = useState([]);
  const [formData, setFormData]   = useState({
    plantId:   '',
    plantName: '',
    taskType:  '',
    dueDate:   ''
  });
  const taskTypes = ['Water', 'Prune', 'Fertilize', 'Harvest', 'Other'];

  // 1) Load saved plants for dropdown
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/user-plants', {
          headers: { Authorization: 'Bearer ' + session.access_token }
        });
        if (!res.ok) return;
        const saved = await res.json();
        setMyPlants(saved);
      } catch {
        // ignore
      }
    })();
  }, [session]);

  // 2) Load tasks on mount
  useEffect(() => {
    fetchTasks();
  }, [session]);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/user-tasks', {
        headers: { Authorization: 'Bearer ' + session.access_token }
      });
      if (!res.ok) return;
      const data = await res.json();
      setTasks(data);
    } catch {
      // ignore
    }
  };

  // 3) Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 4) Submit new task
  const handleAddTask = async () => {
    const { plantId, plantName, taskType, dueDate } = formData;
    if (!taskType || !dueDate) return alert('Task type & due date required.');
    const body = {
      taskType,
      dueDate,
      plantId: plantId || null,
      plantName: plantId
        ? myPlants.find(p => p.id === parseInt(plantId))?.common_name || ''
        : plantName || null
    };
    try {
      const res = await fetch('/api/user-tasks', {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': 'Bearer ' + session.access_token
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) return;
      // Clear form & reload tasks
      setFormData({ plantId: '', plantName: '', taskType: '', dueDate: '' });
      fetchTasks();
    } catch {
      // ignore
    }
  };

  // 5) Delete a task
  const handleDeleteTask = async (taskId) => {
    try {
      const res = await fetch(`/api/user-tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + session.access_token }
      });
      if (!res.ok) return;
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch {
      // ignore
    }
  };

  return (
    <div>
      <h1>Planner</h1>

      <div className="task-form">
        <h2>Add New Task</h2>
        <div className="form-row">
          <label>Plant (optional):</label>
          <select name="plantId" value={formData.plantId} onChange={handleChange}>
            <option value="">— None —</option>
            {myPlants.map(p => (
              <option key={p.id} value={p.id}>{p.common_name}</option>
            ))}
          </select>
        </div>
        {!formData.plantId && (
          <div className="form-row">
            <label>Custom Plant Name:</label>
            <input
              type="text"
              name="plantName"
              placeholder="e.g. Cherry Tomatoes"
              value={formData.plantName}
              onChange={handleChange}
            />
          </div>
        )}
        <div className="form-row">
          <label>Task Type:</label>
          <select name="taskType" value={formData.taskType} onChange={handleChange}>
            <option value="">— Select —</option>
            {taskTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="form-row">
          <label>Due Date:</label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
          />
        </div>
        <button className="btn" onClick={handleAddTask}>Create Task</button>
      </div>

      <h2>My Tasks</h2>
      <div className="tasks-grid">
        {tasks.length === 0 ? (
          <p>No tasks created yet.</p>
        ) : (
          tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={handleDeleteTask}
            />
          ))
        )}
      </div>
    </div>
  );
}
