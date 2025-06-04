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

  // 1) Fetch all plants for this user (including image_url)
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
    if (!window.confirm(`Delete "${plant.common_name}"? This cannot be undone.`)) {
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
      setLoading(false);
      return;
    }

    // (Optional) Remove the file from Storage – uncomment if desired
    // await supabase.storage.from('plant-photos').remove([`${user.id}/${plant.id}/${plant.id}`]);

    setMyPlants((prev) => prev.filter((p) => p.id !== plant.id));
    setLoading(false);
  };

  // 4) Upload a photo file for a specific plant
  const handleUploadPhoto = async (plant, file) => {
    if (!file) return;
    setLoading(true);
    setErrorMsg('');

    // 4.a) Verify that your bucket exists before trying to upload
    //     This helps catch “bucket not found” immediately.
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketNames = buckets.map((b) => b.name);
    if (!bucketNames.includes('plant-photos')) {
      setErrorMsg(
        'Storage bucket "plant-photos" does not exist. Please create it in Supabase.'
      );
      console.error('Available buckets:', bucketNames);
      setLoading(false);
      return;
    }

    // 4.b) Build a unique path: userID/plantID/filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${plant.id}.${fileExt}`; // override name to avoid duplicates
    const filePath = `${user.id}/${plant.id}/${fileName}`;

    // 4.c) Upload the file to "plant-photos" bucket
    const { error: uploadError } = await supabase.storage
      .from('plant-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert:       true,
      });

    if (uploadError) {
      // Log the full error for inspection
      console.error('Supabase Storage uploadError:', uploadError);
      setErrorMsg(`Error uploading photo: ${uploadError.message || JSON.stringify(uploadError)}`);
      setLoading(false);
      return;
    }

    // 4.d) Get the public URL of that uploaded file
    const { data: publicData, error: publicError } = supabase.storage
      .from('plant-photos')
      .getPublicUrl(filePath);

    if (publicError) {
      console.error('Supabase Storage getPublicUrl error:', publicError);
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
      console.error('Supabase Update Error:', updateError);
      setErrorMsg('Error saving photo URL.');
      setLoading(false);
      return;
    }

    // 4.f) Reflect that change in React state so the UI updates immediately
    setMyPlants((prev) =>
      prev.map((p) =>
        p.id === plant.id ? { ...p, image_url: publicUrl } : p
      )
    );

    setLoading(false);
  };

  // 5) Update the 'notes' column for a given plant
  const handleUpdateNotes = async (plantId, newNotes) => {
    setErrorMsg('');
    setMyPlants((prev) =>
      prev.map((p) => (p.id === plantId ? { ...p, notes: newNotes } : p))
    );

    const { error } = await supabase
      .from('plants')
      .update({ notes: newNotes })
      .eq('id', plantId);

    if (error) {
      console.error('Supabase Update Notes Error:', error);
      setErrorMsg('Error saving notes.');
    }
  };

  return (
    <div className="plantlibrary-page">
      <h2>My Plant Library</h2>
      {errorMsg && <p className="error">{errorMsg}</p>}

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
