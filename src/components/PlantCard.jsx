import React, { useRef, useState, useEffect } from 'react';
import '../styles/styles.css';

export default function PlantCard({ plant, onRemove, onUpload, onNotesSave }) {
  const fileInputRef = useRef(null);
  const [localNotes, setLocalNotes] = useState(plant.notes || '');

  useEffect(() => {
    setLocalNotes(plant.notes || '');
  }, [plant.notes]);

  const handleNotesBlur = () => {
    if (onNotesSave) onNotesSave(localNotes);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && onUpload) onUpload(file);
    e.target.value = '';
  };

  return (
    <div className="card plant-card" style={{ width: '220px', display: 'flex', flexDirection: 'column', padding: '0' }}>
      {/* Image / Placeholder */}
      {plant.image_url ? (
        <img
          src={plant.image_url}
          alt={plant.common_name}
          style={{
            width:  '100%',
            height: '140px',
            objectFit: 'cover',
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
            color:         'var(--color-placeholder)',
            fontSize:      '0.9rem',
          }}
        >
          No Photo
        </div>
      )}

      {/* Plant Name */}
      <div
        style={{
          padding:      '0.5rem 0.75rem',
          textAlign:    'center',
          fontWeight:   '500',
          fontSize:     '1rem',
          background:   'var(--color-card-bg)',
        }}
      >
        {plant.common_name}
      </div>

      {/* Notes Textarea */}
      <div style={{ padding: '0.5rem 0.75rem', background: 'var(--color-card-bg)' }}>
        <textarea
          value={localNotes}
          onChange={(e) => setLocalNotes(e.target.value)}
          onBlur={handleNotesBlur}
          placeholder="Add notes…"
          className="input-text"
          style={{
            width:       '100%',
            fontSize:    '0.9rem',
            minHeight:   '60px',
            maxHeight:   '100px',
            margin:      '0',
          }}
        />
      </div>

      {/* Buttons Row */}
      <div
        style={{
          display:        'flex',
          justifyContent: 'space-between',
          padding:        '0.5rem 0.75rem',
          background:     'var(--color-card-bg)',
        }}
      >
        <button
          className="btn small glow-btn"
          onClick={() => fileInputRef.current.click()}
          style={{ flex: 1, marginRight: '0.25rem' }}
        >
          Upload
        </button>
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

      {/* Hidden File Input */}
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
