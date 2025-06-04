// src/components/TaskCard.jsx
import React from 'react';

export default function TaskCard({ task, onDelete }) {
  // Format date as YYYY-MM-DD → Month Day, Year
  const due = new Date(task.due_date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="task-card" data-id={task.id}>
      <div className="task-info">
        <strong>{task.task_type}</strong> {task.plant_name ? ` (${task.plant_name})` : ''}
      </div>
      <div className="task-due">Due: {due}</div>
      <button className="remove-task-btn" onClick={() => onDelete(task.id)}>
        ✕
      </button>
    </div>
  );
}
