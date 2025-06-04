// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';

export default function Dashboard({ session }) {
  const [plantCount, setPlantCount] = useState(0);
  const [tasks, setTasks]           = useState([]);
  const [weather, setWeather]       = useState(null);

  // 1) Fetch plantCount and upcoming tasks
  useEffect(() => {
    (async () => {
      try {
        // Saved plants
        const res1 = await fetch('/api/user-plants', {
          headers: { Authorization: 'Bearer ' + session.access_token }
        });
        if (res1.ok) {
          const plants = await res1.json();
          setPlantCount(plants.length);
        }

        // Upcoming tasks (due within next 7 days)
        const res2 = await fetch('/api/user-tasks', {
          headers: { Authorization: 'Bearer ' + session.access_token }
        });
        if (res2.ok) {
          const tasksAll = await res2.json();
          const today   = new Date();
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);
          const upcoming = tasksAll.filter(t => {
            const due = new Date(t.due_date);
            return due >= today && due <= nextWeek;
          });
          setTasks(upcoming);
        }
      } catch {
        // ignore for now
      }
    })();
  }, [session]);

  // 2) Fetch weather (for a fixed location, e.g., New York lat/lon; you can replace with dynamic)
  useEffect(() => {
    (async () => {
      try {
        // Example lat/lon; ideally user’s location. For demo, use Sydney: lat=-33.8688, lon=151.2093
        const lat = -33.8688;
        const lon = 151.2093;
        const res  = await fetch(`/api/weather?lat=${lat}&lon=${lon}`, {
          headers: { Authorization: 'Bearer ' + session.access_token }
        });
        if (!res.ok) return;
        const data = await res.json();
        setWeather(data.current);
      } catch {
        // ignore
      }
    })();
  }, [session]);

  return (
    <div>
      <h1>Welcome to your Dashboard!</h1>
      <div className="dashboard-cards">
        <div className="card">
          <h3>My Library Size</h3>
          <p><strong>{plantCount}</strong> plants saved</p>
        </div>
        <div className="card">
          <h3>Upcoming Tasks (7 days)</h3>
          {tasks.length === 0 ? (
            <p>No tasks due soon</p>
          ) : (
            <ul>
              {tasks.map(t => {
                const due = new Date(t.due_date).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });
                return <li key={t.id}>{t.task_type} {t.plant_name ? `(${t.plant_name})` : ''} — {due}</li>;
              })}
            </ul>
          )}
        </div>
        <div className="card">
          <h3>Current Weather</h3>
          {weather ? (
            <p>{weather.temp}°C, {weather.weather[0].description}</p>
          ) : (
            <p>Loading…</p>
          )}
        </div>
      </div>
    </div>
  );
}
