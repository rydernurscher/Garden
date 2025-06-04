// src/components/PlantCard.jsx
import React, { useRef, useState, useEffect } from 'react';
import '../styles/styles.css';

export default function PlantCard({ plant, onRemove, onUpload, onNotesSave }) {
  const fileInputRef = useRef(null);
  const [localNotes, setLocalNotes] = useState(plant.notes || '');

  // Keep localNotes in sync if parent updates
  useEffect(() => {
    setLocalNotes(plant.notes || '');
  }, [plant.notes]);

  // When textarea loses focus, notify parent to save
  const handleNotesBlur = () => {
    if (onNotesSave) {
      onNotesSave(localNotes);
    }
  };

  // Upload handler when a file is selected
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && onUpload) {
      onUpload(file);
    }
    e.target.value = ''; // reset so same file can be reselected later
  };

  return (
    <div
      className="card plant-card"
      style={{
        width:            '220px',
        display:          'flex',
        flexDirection:    'column',
        padding:          '0',
        overflow:         'hidden',
      }}
    >
      {/* ===== Image or Placeholder ===== */}
      {plant.image_url ? (
        <img
          src={plant.image_url}
          alt={plant.common_name}
          style={{
            width:       '100%',
            height:      '140px',
            objectFit:   'cover',
          }}
        />
      ) : (
        <div
          style={{
            width:         '100%',
            height:        '140px',
            background:    '#e2e8f0',
            display:       'flex',
            alignItems:    'center',
            justifyContent:'center',
            color:         '#718096',
            fontSize:      '0.9rem',
          }}
        >
          No Photo
        </div>
      )}

      {/* ===== Plant Name ===== */}
      <div
        style={{
          padding:      '0.5rem 0.75rem 0',
          textAlign:    'center',
          fontWeight:   '500',
          fontSize:     '1rem',
          background:   '#fff',
        }}
      >
        {plant.common_name}
      </div>

      {/* ===== Notes Textarea ===== */}
      <textarea
        value={localNotes}
        onChange={(e) => setLocalNotes(e.target.value)}
        onBlur={handleNotesBlur}
        placeholder="Add notes…"
        style={{
          margin:        '0.5rem 0.75rem',
          padding:       '0.5rem',
          fontSize:      '0.9rem',
          border:        '1px solid #cbd5e0',
          borderRadius:  '6px',
          resize:        'vertical',
          minHeight:     '60px',
          maxHeight:     '100px',
          background:    '#fff',
          color:         '#333',
        }}
      />

      {/* ===== Buttons Row ===== */}
      <div
        style={{
          display:        'flex',
          justifyContent: 'space-between',
          padding:        '0.5rem 0.75rem 0.75rem',
          background:     '#fff',
        }}
      >
        {/* Upload Photo */}
        <button
          className="btn small glow-btn"
          onClick={() => fileInputRef.current.click()}
          style={{ flex: 1, marginRight: '0.25rem' }}
        >
          Upload
        </button>

        {/* Remove Plant */}
        <button
          className="btn small glow-btn"
          onClick={onRemove}
          style={{
            flex:            1,
            marginLeft:      '0.25rem',
            backgroundColor: '#e53e3e',
          }}
        >
          Remove
        </button>
      </div>

      {/* Hidden file input (triggered by Upload button) */}
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </div>
  );
}
