// src/components/TaskCard.jsx
import React from 'react';
import '../styles/styles.css';

/**
 * Helper: format a YYYY-MM-DD string into DD/MM/YYYY
 */
function formatDateToDDMMYYYY(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr; // fallback if parsing fails

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export default function TaskCard({ task, onDelete }) {
  const formattedDue = formatDateToDDMMYYYY(task.due_date);

  return (
    <div
      className="card task-card"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem',
      }}
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
        <span
          style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem' }}
        >
          Due: {formattedDue}
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
