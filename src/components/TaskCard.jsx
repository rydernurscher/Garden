// src/components/TaskCard.jsx
import React from 'react';
import '../styles/styles.css';

export default function TaskCard({ task, onDelete }) {
  return (
    <div className="card task-card">
      <div>
        <strong>{task.task_type}</strong>
        {task.plant_name && ` – ${task.plant_name}`}
        <div>Due: {task.due_date}</div>
      </div>
      <button className="btn small glow-btn" onClick={() => onDelete(task.id)}>
        Delete
      </button>
    </div>
  );
}
