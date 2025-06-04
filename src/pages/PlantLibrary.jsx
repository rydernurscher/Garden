// src/pages/PlantLibrary.jsx
import React, { useEffect, useState } from 'react';
import PlantCard from '../components/PlantCard';
import { supabase } from '../api/supabaseClient';
import '../styles/styles.css';

export default function PlantLibrary({ session }) {
  const user = session.user;
  const [plantName, setPlantName] = useState('');
  const [myPlants, setMyPlants]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [errorMsg, setErrorMsg]   = useState('');

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('plants')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      setErrorMsg('Error loading plants');
    } else {
      setMyPlants(data);
    }
    setLoading(false);
  };

  const handleAddPlant = async () => {
    if (!plantName.trim()) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('plants')
      .insert([{ user_id: user.id, common_name: plantName.trim() }])
      .select();
    if (error) {
      setErrorMsg('Error adding plant');
    } else {
      setMyPlants([data[0], ...myPlants]);
      setPlantName('');
    }
    setLoading(false);
  };

  const handleRemovePlant = async (plant) => {
    setLoading(true);
    const { error } = await supabase
      .from('plants')
      .delete()
      .eq('id', plant.id);
    if (error) {
      setErrorMsg('Error removing plant');
    } else {
      setMyPlants(myPlants.filter((p) => p.id !== plant.id));
    }
    setLoading(false);
  };

  return (
    <div className="plantlibrary-page">
      <h2>My Plant Library</h2>
      {errorMsg && <p className="error">{errorMsg}</p>}

      <div className="add-plant-form">
        <input
          type="text"
          className="input-text"
          value={plantName}
          onChange={(e) => setPlantName(e.target.value)}
          placeholder="e.g. Tomato, Basil, Rose"
        />
        <button
          className="btn glow-btn"
          onClick={handleAddPlant}
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Plant'}
        </button>
      </div>

      {loading && <p>Loading plants...</p>}
      {!loading && (
        <>
          {myPlants.length === 0 ? (
            <p>No plants added yet.</p>
          ) : (
            <div className="grid">
              {myPlants.map((p) => (
                <PlantCard
                  key={p.id}
                  plant={p}
                  onRemove={handleRemovePlant}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
