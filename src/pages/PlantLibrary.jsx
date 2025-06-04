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
    const { data, error } = await supabase
      .from('plants')
      .select('id, common_name, image_url')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      setErrorMsg('Error loading plants');
    } else {
      setMyPlants(data);
    }
    setLoading(false);
  };

  // 2) Add a new plant (no image_url yet)
  const handleAddPlant = async () => {
    if (!plantName.trim()) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('plants')
      .insert([
        {
          user_id:     user.id,
          common_name: plantName.trim(),
        },
      ])
      .select('id, common_name, image_url');

    if (error) {
      setErrorMsg('Error adding plant');
    } else {
      // Prepend the new plant (its image_url is null at first)
      setMyPlants([data[0], ...myPlants]);
      setPlantName('');
    }
    setLoading(false);
  };

  // 3) Remove a plant entirely (and its photo, optionally)
  const handleRemovePlant = async (plant) => {
    setLoading(true);
    const { error } = await supabase
      .from('plants')
      .delete()
      .eq('id', plant.id);

    if (error) {
      setErrorMsg('Error removing plant');
    } else {
      // Also optionally delete the photo from Storage
      // (uncomment if you want to remove the file)
      // await supabase
      //   .storage
      //   .from('plant-photos')
      //   .remove([`${user.id}/${plant.id}/${plant.id}`]); 

      setMyPlants(myPlants.filter((p) => p.id !== plant.id));
    }
    setLoading(false);
  };

  // 4) Upload a photo file for a specific plant
  const handleUploadPhoto = async (plant, file) => {
    if (!file) return;
    setLoading(true);
    setErrorMsg('');

    // 4.a) Build a unique path: userID/plantID/filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${plant.id}.${fileExt}`; // override name to avoid duplicates
    const filePath = `${user.id}/${plant.id}/${fileName}`;

    // 4.b) Upload the file to "plant-photos" bucket
    const { error: uploadError } = await supabase.storage
      .from('plant-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert:       true,
      });

    if (uploadError) {
      setErrorMsg('Error uploading photo');
      setLoading(false);
      return;
    }

    // 4.c) Get the public URL of that uploaded file
    const { data: publicData } = supabase.storage
      .from('plant-photos')
      .getPublicUrl(filePath);

    const publicUrl = publicData.publicUrl;

    // 4.d) Update the plant row with the new image_url
    const { error: updateError } = await supabase
      .from('plants')
      .update({ image_url: publicUrl })
      .eq('id', plant.id);

    if (updateError) {
      setErrorMsg('Error saving photo URL');
    } else {
      // Reflect that change in React state so the UI updates immediately
      setMyPlants((prev) =>
        prev.map((p) =>
          p.id === plant.id ? { ...p, image_url: publicUrl } : p
        )
      );
    }

    setLoading(false);
  };

  return (
    <div className="plantlibrary-page">
      <h2>My Plant Library</h2>
      {errorMsg && <p className="error">{errorMsg}</p>}

      {/* Add Plant Form */}
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

      {/* Show a loading indicator */}
      {loading && <p>Loading plants…</p>}

      {/* Plant Grid */}
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
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
