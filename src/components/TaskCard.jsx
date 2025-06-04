import React from 'react';
import '../styles/styles.css';

export default function TaskCard({ task, onDelete }) {
  return (
    <div
      className="card task-card"
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem' }}
    >
      <div>
        <strong style={{ display: 'block', marginBottom: '0.25rem' }}>
          {task.task_type}
        </strong>
        <span style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
          {task.plant_name ? `For: ${task.plant_name}` : 'General'}
        </span>
      </div>
      <div style={{ textAlign: 'right' }}>
        <span style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
          Due: {task.due_date}
        </span>
        <button
          className="btn small glow-btn"
          onClick={onDelete}
          style={{ marginTop: '0.25rem', backgroundColor: '#e53e3e' }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
