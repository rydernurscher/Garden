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

  // Fetch all plants (including image_url and notes) for this user
  const fetchPlants = async () => {
    setLoading(true);
    setErrorMsg('');

    const { data, error } = await supabase
      .from('plants')
      .select('id, common_name, image_url, notes')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      setErrorMsg('Error loading plants.');
    } else {
      setMyPlants(data);
    }
    setLoading(false);
  };

  // Add a new plant (notes defaults to '')
  const handleAddPlant = async () => {
    if (!plantName.trim()) return;
    setLoading(true);
    setErrorMsg('');

    const { data, error } = await supabase
      .from('plants')
      .insert([
        {
          user_id:     user.id,
          common_name: plantName.trim(),
          notes:       '',
        },
      ])
      .select('id, common_name, image_url, notes');

    if (error) {
      setErrorMsg('Error adding plant.');
    } else {
      // Prepend the new plant (it has no photo yet, notes = '')
      setMyPlants([data[0], ...myPlants]);
      setPlantName('');
    }
    setLoading(false);
  };

  // Remove a plant row (and optionally its photo file)
  const handleRemovePlant = async (plant) => {
    setLoading(true);
    setErrorMsg('');

    // 1) Delete the row
    const { error } = await supabase
      .from('plants')
      .delete()
      .eq('id', plant.id);

    if (error) {
      setErrorMsg('Error removing plant.');
      setLoading(false);
      return;
    }

    // 2) (Optional) Delete the file from Storage if you want to clean up.
    // Uncomment to remove the photo file as well:
    // await supabase.storage
    //   .from('plant-photos')
    //   .remove([`${user.id}/${plant.id}/${plant.id}`]);

    // 3) Update local state
    setMyPlants((prev) => prev.filter((p) => p.id !== plant.id));
    setLoading(false);
  };

  // Upload a photo file for a specific plant
  const handleUploadPhoto = async (plant, file) => {
    if (!file) return;
    setLoading(true);
    setErrorMsg('');

    // Build a unique path: userID/plantID/plantID.ext
    const fileExt = file.name.split('.').pop();
    const fileName = `${plant.id}.${fileExt}`;
    const filePath = `${user.id}/${plant.id}/${fileName}`;

    // 1) Upload to "plant-photos" bucket
    const { error: uploadError } = await supabase.storage
      .from('plant-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert:       true,
      });

    if (uploadError) {
      setErrorMsg('Error uploading photo.');
      setLoading(false);
      return;
    }

    // 2) Get the public URL
    const { data: publicData } = supabase.storage
      .from('plant-photos')
      .getPublicUrl(filePath);

    const publicUrl = publicData.publicUrl;

    // 3) Update the plant row with image_url
    const { error: updateError } = await supabase
      .from('plants')
      .update({ image_url: publicUrl })
      .eq('id', plant.id);

    if (updateError) {
      setErrorMsg('Error saving photo URL.');
      setLoading(false);
      return;
    }

    // 4) Reflect it immediately in local state
    setMyPlants((prev) =>
      prev.map((p) =>
        p.id === plant.id ? { ...p, image_url: publicUrl } : p
      )
    );

    setLoading(false);
  };

  // Update the 'notes' column for a given plant
  const handleUpdateNotes = async (plantId, newNotes) => {
    setErrorMsg('');
    // Optimistically update UI first
    setMyPlants((prev) =>
      prev.map((p) => (p.id === plantId ? { ...p, notes: newNotes } : p))
    );

    const { error } = await supabase
      .from('plants')
      .update({ notes: newNotes })
      .eq('id', plantId);

    if (error) {
      setErrorMsg('Error saving notes.');
    }
  };

  return (
    <div className="plantlibrary-page">
      <h2>My Plant Library</h2>
      {errorMsg && <p className="error">{errorMsg}</p>}

      {/* ===== Add Plant Form ===== */}
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
          {loading ? 'Adding…' : 'Add Plant'}
        </button>
      </div>

      {/* ===== Loading Indicator ===== */}
      {loading && <p>Loading plants…</p>}

      {/* ===== Plant Grid ===== */}
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
                  onRemove={() => handleRemovePlant(p)}
                  onUpload={(file) => handleUploadPhoto(p, file)}
                  onNotesSave={(updatedNotes) =>
                    handleUpdateNotes(p.id, updatedNotes)
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
