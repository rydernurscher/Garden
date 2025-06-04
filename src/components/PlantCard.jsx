// src/components/PlantCard.jsx
import React from 'react';

export default function PlantCard({ plant, onAdd, onRemove }) {
  return (
    <div className="plant-card" data-id={plant.id}>
      {plant.image_url ? (
        <img
          src={plant.image_url}
          alt={plant.common_name}
          className="plant-image"
        />
      ) : (
        <div className="plant-image placeholder">No Image</div>
      )}
      <div className="plant-card-header">{plant.common_name}</div>
      <div className="plant-card-body">
        <p><em>{plant.scientific_name}</em></p>
        {plant.family && <p>Family: {plant.family}</p>}
      </div>
      {onAdd && (
        <button className="add-btn" onClick={onAdd}>
          Save +
        </button>
      )}
      {onRemove && (
        <button className="remove-btn" onClick={onRemove}>
          Remove ✕
        </button>
      )}
    </div>
  );
}
