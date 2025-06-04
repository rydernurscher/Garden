// src/pages/Planner.jsx
import React, { useEffect, useState } from 'react';
import TaskCard from '../components/TaskCard';

export default function Planner() {
  const [myPlants, setMyPlants]   = useState([]);
  const [tasks, setTasks]         = useState([]);
  const [formData, setFormData]   = useState({
    plantId:  '',
    taskType: '',
    dueDate:  ''
  });

  const taskTypes = ['Water', 'Prune', 'Fertilize', 'Harvest', 'Other'];

  // 1) Load saved plants (from localStorage) and tasks on mount
  useEffect(() => {
    const storedPlants = localStorage.getItem('myPlants');
    if (storedPlants) {
      try {
        setMyPlants(JSON.parse(storedPlants));
      } catch {
        setMyPlants([]);
      }
    }
    const storedTasks = localStorage.getItem('myTasks');
    if (storedTasks) {
      try {
        setTasks(JSON.parse(storedTasks));
      } catch {
        setTasks([]);
      }
    }
  }, []);

  // 2) Whenever tasks change, sync to localStorage
  useEffect(() => {
    localStorage.setItem('myTasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleCreateTask = () => {
    const { plantId, taskType, dueDate } = formData;
    if (!taskType || !dueDate) return; // require at least task type and due date

    // Look up plant name by ID (if any)
    let plantName = '';
    if (plantId) {
      const found = myPlants.find((p) => p.id === plantId);
      plantName = found ? found.common_name : '';
    }

    const newTask = {
      id: Date.now().toString(),
      plant_id:   plantId,
      plant_name: plantName,
      task_type:  taskType,
      due_date:   dueDate
    };

    setTasks([newTask, ...tasks]);
    // Reset form (leave plant selection intact if desired)
    setFormData({
      plantId:  '',
      taskType: '',
      dueDate:  ''
    });
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  return (
    <div className="planner-page">
      <h2>Planner</h2>

      <div className="add-task-form">
        <label>Attach to Plant (optional)</label>
        <select
          name="plantId"
          value={formData.plantId}
          onChange={handleChange}
        >
          <option value="">None</option>
          {myPlants.map((p) => (
            <option key={p.id} value={p.id}>
              {p.common_name}
            </option>
          ))}
        </select>

        <label>Task Type</label>
        <select
          name="taskType"
          value={formData.taskType}
          onChange={handleChange}
        >
          <option value="">Select a task</option>
          {taskTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <label>Due Date</label>
        <input
          type="date"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
        />

        <button className="btn small" onClick={handleCreateTask}>
          Create Task
        </button>
      </div>

      <h3>Upcoming Tasks:</h3>
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
    </div>
  );
}
