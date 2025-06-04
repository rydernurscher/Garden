// public/assets/library.js

window.addEventListener('DOMContentLoaded', () => {
  const token      = localStorage.getItem('token');
  const searchIn   = document.getElementById('search');
  const searchBtn  = document.getElementById('btn-search');
  const resultsDiv = document.getElementById('results');
  const myPlants   = document.getElementById('myplants');
  let lastResults  = [];

  function debounce(fn, delay = 300) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  }

  async function performSearch(query) {
    if (!query) {
      resultsDiv.innerHTML = '';
      return;
    }
    resultsDiv.innerHTML = '<p>Searching...</p>';

    try {
      const res = await fetch(
        '/api/search-plants?q=' + encodeURIComponent(query),
        { headers: { 'Authorization': 'Bearer ' + token } }
      );
      if (!res.ok) {
        resultsDiv.innerHTML = '<p>Unable to fetch suggestions.</p>';
        return;
      }

      const plants = await res.json();
      if (!Array.isArray(plants) || plants.length === 0) {
        resultsDiv.innerHTML = '<p>No suggestions.</p>';
        return;
      }

      lastResults = plants;
      resultsDiv.innerHTML = plants
        .map((p, i) =>
          `<div class="search-item" data-index="${i}">
             <strong>${p.common_name}</strong><br/>
             <small>${p.description || 'No description'}</small>
           </div>`
        )
        .join('');
    } catch {
      resultsDiv.innerHTML = '<p>Network error. Please try again.</p>';
    }
  }

  function renderCard(plant) {
    resultsDiv.innerHTML =
      `<div class="plant-card" data-id="${plant.id}">
         <div class="plant-card-header">${plant.common_name}</div>
         <div class="plant-card-body">
           <p>${plant.description || 'No description'}</p>
           <p>
             <a href="https://openfarm.cc/en/vegetable-crops/${plant.id}" target="_blank">
               View on OpenFarm
             </a>
           </p>
         </div>
         <button class="add-btn">Save +</button>
       </div>`;
  }

  resultsDiv.addEventListener('click', async (e) => {
    const item = e.target.closest('.search-item');
    if (item) {
      const idx = Number(item.dataset.index);
      renderCard(lastResults[idx]);
      return;
    }
    if (e.target.classList.contains('add-btn')) {
      const card    = e.target.closest('.plant-card');
      const plantId = card.dataset.id;
      const plant   = lastResults.find(p => String(p.id) === plantId);

      try {
        const resp = await fetch('/api/user-plants', {
          method: 'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify({ plantId: plant.id, plantData: plant })
        });
        if (!resp.ok) return;

        const div = document.createElement('div');
        div.className = 'myplant-item';
        div.textContent = plant.common_name;
        myPlants.appendChild(div);

        resultsDiv.innerHTML = '';
        searchIn.value = '';
      } catch {
        // Silently ignore
      }
    }
  });

  const debouncedSearch = debounce(performSearch, 300);
  searchIn.addEventListener('input', (e) => debouncedSearch(e.target.value.trim()));
  searchBtn.addEventListener('click', () => performSearch(searchIn.value.trim()));

  // Initial load of saved plants
  (async () => {
    try {
      const res = await fetch('/api/user-plants', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (!res.ok) return;
      const saved = await res.json();
      saved.forEach((p) => {
        const div = document.createElement('div');
        div.className = 'myplant-item';
        div.textContent = p.common_name;
        myPlants.appendChild(div);
      });
    } catch {
      // Ignore load errors
    }
  })();
});
