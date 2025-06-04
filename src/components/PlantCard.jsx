// src/components/PlantCard.jsx
import React, { useRef } from 'react';
import '../styles/styles.css';

export default function PlantCard({ plant, onRemove, onUpload }) {
  // We’ll use a ref to trigger the hidden file input
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && onUpload) {
      onUpload(file);
    }
    // Clear the input so the same file can be reselected if needed
    e.target.value = '';
  };

  return (
    <div className="card plant-card" style={{ width: '200px' }}>
      {/* 1) Thumbnail if image_url exists */}
      {plant.image_url ? (
        <img
          src={plant.image_url}
          alt={plant.common_name}
          style={{
            width:       '100%',
            height:      '120px',
            objectFit:   'cover',
            borderRadius:'8px 8px 0 0',
            marginBottom:'0.5rem',
          }}
        />
      ) : (
        <div
          style={{
            width:         '100%',
            height:        '120px',
            background:    '#e2e8f0',
            display:       'flex',
            alignItems:    'center',
            justifyContent:'center',
            color:         '#718096',
            borderRadius:  '8px',
            marginBottom:  '0.5rem',
            fontSize:      '0.9rem',
          }}
        >
          No Photo
        </div>
      )}

      {/* 2) Plant name */}
      <div style={{ textAlign: 'center', fontWeight: '500', marginBottom: '0.5rem' }}>
        {plant.common_name}
      </div>

      {/* 3) Buttons: Upload Photo / Remove */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Trigger hidden file input */}
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
          style={{ flex: 1, marginLeft: '0.25rem', backgroundColor: '#e53e3e' }}
        >
          Remove
        </button>
      </div>

      {/* 4) Hidden file input */}
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
