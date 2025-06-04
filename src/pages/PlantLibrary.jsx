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

  // 1) Fetch all plants for this user (including image_url and notes)
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

  // 2) Add a new plant (no image_url yet)
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
      setMyPlants([data[0], ...myPlants]);
      setPlantName('');
    }
    setLoading(false);
  };

  // 3) Remove a plant (and optionally its photo)
  const handleRemovePlant = async (plant) => {
    if (!window.confirm(`Delete "${plant.common_name}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase
      .from('plants')
      .delete()
      .eq('id', plant.id);

    if (error) {
      setErrorMsg('Error removing plant.');
    } else {
      setMyPlants((prev) => prev.filter((p) => p.id !== plant.id));
      // Optionally delete the file from storage here if desired:
      // await supabase.storage.from('plant-photos').remove([`${user.id}/${plant.id}/${plant.id}`]);
    }
    setLoading(false);
  };

  // 4) Upload a photo file for a specific plant
  const handleUploadPhoto = async (plant, file) => {
    if (!file) return;

    // Clear any previous error, then show a loading state
    setErrorMsg('');
    setLoading(true);

    // 4.a) Verify that the "plant-photos" bucket actually exists
    const { data: bucketList, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
      setErrorMsg('Unable to list storage buckets. Check your Supabase keys.');
      setLoading(false);
      return;
    }
    const bucketNames = bucketList.map((b) => b.name);
    if (!bucketNames.includes('plant-photos')) {
      setErrorMsg(
        'Storage bucket "plant-photos" not found. Create it in Supabase → Storage → New Bucket → "plant-photos" (public).'
      );
      setLoading(false);
      return;
    }

    // 4.b) Build a unique path: userID/plantID/filename.ext
    const fileExt = file.name.split('.').pop();
    const fileName = `${plant.id}.${fileExt}`;
    const filePath = `${user.id}/${plant.id}/${fileName}`;

    try {
      // 4.c) Upload the file to the bucket
      const { error: uploadError } = await supabase.storage
        .from('plant-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert:       true,
        });

      if (uploadError) {
        // Show the error message directly in an alert so it’s visible on Vercel
        alert(`Upload Error: ${uploadError.message}`);
        setErrorMsg(`Upload failed: ${uploadError.message}`);
        setLoading(false);
        return;
      }

      // 4.d) Get the public URL for the uploaded file
      const { data: publicData, error: publicError } = supabase.storage
        .from('plant-photos')
        .getPublicUrl(filePath);

      if (publicError) {
        alert(`Public URL Error: ${publicError.message}`);
        setErrorMsg('Error retrieving public URL.');
        setLoading(false);
        return;
      }
      const publicUrl = publicData.publicUrl;

      // 4.e) Update the plant row with the new image_url
      const { error: updateError } = await supabase
        .from('plants')
        .update({ image_url: publicUrl })
        .eq('id', plant.id);

      if (updateError) {
        alert(`Database Update Error: ${updateError.message}`);
        setErrorMsg('Error saving photo URL.');
        setLoading(false);
        return;
      }

      // 4.f) Reflect that change in React state for immediate UI update
      setMyPlants((prev) =>
        prev.map((p) =>
          p.id === plant.id ? { ...p, image_url: publicUrl } : p
        )
      );
    } catch (err) {
      // Catch any unexpected exceptions
      alert(`Unexpected Error: ${err.message}`);
      setErrorMsg(`Unexpected error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 5) Update the 'notes' column for a given plant
  const handleUpdateNotes = async (plantId, newNotes) => {
    setErrorMsg('');
    // Optimistically update UI
    setMyPlants((prev) =>
      prev.map((p) => (p.id === plantId ? { ...p, notes: newNotes } : p))
    );

    const { error } = await supabase
      .from('plants')
      .update({ notes: newNotes })
      .eq('id', plantId);

    if (error) {
      alert(`Error saving notes: ${error.message}`);
      setErrorMsg('Error saving notes.');
    }
  };

  return (
    <div className="plantlibrary-page">
      <h2>My Plant Library</h2>

      {/* Display any error message here */}
      {errorMsg && (
        <p className="error" style={{ marginBottom: '1rem' }}>
          {errorMsg}
        </p>
      )}

      {/* ===== Add Plant Form ===== */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            className="input-text"
            value={plantName}
            onChange={(e) => setPlantName(e.target.value)}
            placeholder="e.g. Tomato, Basil, Rose"
            style={{ flex: 1, minWidth: '200px' }}
          />
          <button
            className="btn glow-btn"
            onClick={handleAddPlant}
            disabled={loading}
          >
            {loading ? 'Adding…' : 'Add Plant'}
          </button>
        </div>
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
                  onNotesSave={(updatedNotes) => handleUpdateNotes(p.id, updatedNotes)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
