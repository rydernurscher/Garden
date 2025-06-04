// src/pages/PlantLibrary.jsx
import React, { useEffect, useState } from 'react';
import PlantCard from '../components/PlantCard';

export default function PlantLibrary() {
  const [plantName, setPlantName] = useState('');
  const [myPlants, setMyPlants]   = useState([]);

  // Load saved plants from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('myPlants');
    if (stored) {
      try {
        setMyPlants(JSON.parse(stored));
      } catch {
        setMyPlants([]);
      }
    }
  }, []);

  // Whenever myPlants changes, sync to localStorage
  useEffect(() => {
    localStorage.setItem('myPlants', JSON.stringify(myPlants));
  }, [myPlants]);

  const handleAddPlant = () => {
    if (!plantName.trim()) return;
    const newPlant = {
      id: Date.now().toString(),
      common_name: plantName.trim(),
      image_url: '' // no image in manual mode
    };
    setMyPlants([newPlant, ...myPlants]);
    setPlantName('');
  };

  const handleRemovePlant = (plant) => {
    setMyPlants(myPlants.filter((p) => p.id !== plant.id));
  };

  return (
    <div className="plantlibrary-page">
      <h2>My Plant Library</h2>

      <div className="add-plant-form">
        <label>Add a new plant</label>
        <input
          type="text"
          value={plantName}
          onChange={(e) => setPlantName(e.target.value)}
          placeholder="e.g. Tomato, Basil, Rose"
        />
        <button className="btn small" onClick={handleAddPlant}>
          Add Plant
        </button>
      </div>

      <h3>Plants in Your Garden:</h3>
      {myPlants.length === 0 ? (
        <p>No plants added yet.</p>
      ) : (
        <div className="grid">
          {myPlants.map((p) => (
            <PlantCard
              key={p.id}
              plant={p}
              onRemove={() => handleRemovePlant(p)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
