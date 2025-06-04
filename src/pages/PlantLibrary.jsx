// src/pages/PlantLibrary.jsx
import React, { useEffect, useState } from 'react';
import PlantCard from '../components/PlantCard';

export default function PlantLibrary({ session }) {
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState([]);
  const [myPlants, setMyPlants] = useState([]);

  // 1) Load saved plants on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/user-plants', {
          headers: { Authorization: 'Bearer ' + session.access_token }
        });
        if (!res.ok) return;
        const saved = await res.json();
        setMyPlants(saved);
      } catch {
        // ignore
      }
    })();
  }, [session]);

  // Debounce helper
  let timerId = null;
  const debounce = (fn, delay = 300) => {
    return (...args) => {
      clearTimeout(timerId);
      timerId = setTimeout(() => fn(...args), delay);
    };
  };

  // 2) Perform Trefle search
  const performSearch = async (q) => {
    if (!q) {
      setResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/search-species?q=${encodeURIComponent(q)}`, {
        headers: { Authorization: 'Bearer ' + session.access_token }
      });
      if (!res.ok) {
        setResults([]);
        return;
      }
      const species = await res.json();
      setResults(species);
    } catch {
      setResults([]);
    }
  };

  const debouncedSearch = debounce(performSearch, 300);

  // 3) Add a plant to user library
  const handleAddPlant = async (plant) => {
    try {
      const resp = await fetch('/api/user-plants', {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': 'Bearer ' + session.access_token
        },
        body: JSON.stringify({ plantId: plant.id, plantData: plant })
      });
      if (!resp.ok) return;
      setMyPlants(prev => [...prev, plant]);
    } catch {
      // ignore
    }
  };

  // 4) Remove a saved plant
  const handleRemovePlant = async (plant) => {
    try {
      const resp = await fetch(`/api/user-plants/${plant.id}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + session.access_token }
      });
      if (!resp.ok) return;
      setMyPlants(prev => prev.filter(p => p.id !== plant.id));
    } catch {
      // ignore
    }
  };

  return (
    <div>
      <h1>Plant Library</h1>
      <div className="search-bar">
        <input
          placeholder="Search plants..."
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            debouncedSearch(e.target.value.trim());
          }}
        />
        <button className="btn small" onClick={() => performSearch(query.trim())}>
          Search
        </button>
      </div>

      <div id="results" className="grid">
        {results.map(p => (
          <PlantCard
            key={p.id}
            plant={p}
            onAdd={() => handleAddPlant(p)}
          />
        ))}
      </div>

      <h2>My Plants</h2>
      <div id="myplants" className="grid">
        {myPlants.map(p => (
          <PlantCard
            key={p.id}
            plant={p}
            onRemove={() => handleRemovePlant(p)}
          />
        ))}
      </div>
    </div>
  );
}
