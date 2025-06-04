// src/components/PlantCard.jsx
import React from 'react';
import '../styles/styles.css';

export default function PlantCard({ plant, onRemove }) {
  return (
    <div className="card plant-card">
      <span>{plant.common_name}</span>
      <button className="btn small glow-btn" onClick={() => onRemove(plant)}>
        Remove
      </button>
    </div>
  );
}
