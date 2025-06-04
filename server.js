// server.js
require('dotenv').config();
const express          = require('express');
const path             = require('path');
const helmet           = require('helmet');
const rateLimit        = require('express-rate-limit');
const cors             = require('cors');
const axios            = require('axios');
const http             = require('http');
const https            = require('https');
const { createClient } = require('@supabase/supabase-js');
const serverless       = require('serverless-http');

const PORT = process.env.PORT || 3000;
const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  TREFLE_API_TOKEN,
  OPENWEATHER_API_KEY
} = process.env;

// ─── DEBUG: log required server envs ─────────────────────────────────────────
console.log('🔴 SERVER_ENV SUPABASE_URL               =', SUPABASE_URL);
console.log('🔴 SERVER_ENV SUPABASE_SERVICE_ROLE_KEY   =', SUPABASE_SERVICE_ROLE_KEY ? '****present****' : undefined);
console.log('🔴 SERVER_ENV TREFLE_API_TOKEN           =', TREFLE_API_TOKEN ? '****present****' : undefined);
console.log('🔴 SERVER_ENV OPENWEATHER_API_KEY         =', OPENWEATHER_API_KEY ? '****present****' : undefined);
// ───────────────────────────────────────────────────────────────────────────────

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !TREFLE_API_TOKEN || !OPENWEATHER_API_KEY) {
  console.error('⛔️ Missing one or more required environment variables!');
  process.exit(1);
}

// Supabase Admin client (server-side; service role)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const app = express();

// ─── Security & Middleware ─────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:     ["'self'"],
      scriptSrc:      ["'self'"],
      styleSrc:       ["'self'"],
      connectSrc:     ["'self'", SUPABASE_URL, 'https://api.openweathermap.org', 'https://trefle.io'],
      imgSrc:         ["'self'", 'data:'],
      fontSrc:        ["'self'"],
      objectSrc:      ["'none'"],
      baseUri:        ["'self'"],
      frameAncestors: ["'none'"]
    }
  }
}));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// ─── Serve React build (dist/) ─────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'dist')));

// ─── Auth Middleware ───────────────────────────────────────────────────────────
async function auth(req, res, next) {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).json({ msg: 'No token provided' });
  }
  const [scheme, token] = authorization.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ msg: 'Malformed token' });
  }
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ msg: 'Invalid or expired token' });
    }
    req.userId = data.user.id;
    next();
  } catch (err) {
    console.error('❌ Auth failure:', err);
    return res.status(401).json({ msg: 'Auth failure' });
  }
}

// ─── In-Memory Cache for Trefle Searches (TTL 5 mins) ───────────────────────────
const CACHE_TTL_MS = 5 * 60 * 1000;
const cacheStore   = Object.create(null);
// cacheStore[q] = { timestamp: <ms>, data: […] }

function getCached(q) {
  const entry = cacheStore[q];
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    delete cacheStore[q];
    return null;
  }
  return entry.data;
}
function setCache(q, data) {
  cacheStore[q] = { timestamp: Date.now(), data };
}

// Axios Instance forcing IPv4 (avoid DNS timeouts)
const axiosInstance = axios.create({
  httpAgent:  new http.Agent({ family: 4 }),
  httpsAgent: new https.Agent({ family: 4 })
});

// ─── 1) SEARCH SPECIES via Trefle ──────────────────────────────────────────────
// GET /api/search-species?q=<term>
app.get('/api/search-species', auth, async (req, res) => {
  try {
    const rawQuery = (req.query.q || '').trim();
    const q        = rawQuery.toLowerCase();
    if (!q) return res.json([]);

    // Check cache
    const cached = getCached(q);
    if (cached) return res.json(cached);

    // Build Trefle URL
    const trefleUrl = `https://trefle.io/api/v1/species/search?token=${encodeURIComponent(TREFLE_API_TOKEN)}&q=${encodeURIComponent(rawQuery)}`;

    // Timeout after 2 s
    const controller = new AbortController();
    const timer      = setTimeout(() => controller.abort(), 2000);

    const response = await axiosInstance.get(trefleUrl, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timer);

    const species = Array.isArray(response.data.data) ? response.data.data : [];
    const mapped  = species.map(s => ({
      id:              s.id,
      common_name:     s.common_name || s.scientific_name,
      scientific_name: s.scientific_name,
      image_url:       s.image_url || null,
      family:          s.family || ''
    }));

    setCache(q, mapped);
    return res.json(mapped);
  } catch (err) {
    console.error('❌ /api/search-species error:', err.stack || err);
    return res.status(500).json({ msg: 'Internal server error in search-species' });
  }
});

// ─── 2) USER_PLANTS CRUD (Supabase) ───────────────────────────────────────────
// GET /api/user-plants
app.get('/api/user-plants', auth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_plants')
      .select('plant_data')
      .eq('user_id', req.userId);
    if (error) {
      console.error('❌ Supabase SELECT error (user_plants):', error);
      return res.status(500).json({ msg: 'Database error' });
    }
    return res.json(data.map(r => r.plant_data));
  } catch (err) {
    console.error('❌ /api/user-plants GET error:', err.stack || err);
    return res.status(500).json({ msg: 'Internal server error in user-plants GET' });
  }
});

// POST /api/user-plants { plantId, plantData }
app.post('/api/user-plants', auth, async (req, res) => {
  try {
    const { plantId, plantData } = req.body;
    if (!plantId || !plantData) {
      return res.status(400).json({ msg: 'plantId & plantData required' });
    }
    const { error } = await supabaseAdmin
      .from('user_plants')
      .insert([{ user_id: req.userId, plant_id: plantId, plant_data: plantData }]);
    if (error) {
      console.error('❌ Supabase INSERT error (user_plants):', error);
      return res.status(500).json({ msg: 'Database error' });
    }
    return res.json({ msg: 'Added' });
  } catch (err) {
    console.error('❌ /api/user-plants POST error:', err.stack || err);
    return res.status(500).json({ msg: 'Internal server error in user-plants POST' });
  }
});

// DELETE /api/user-plants/:plantId
app.delete('/api/user-plants/:plantId', auth, async (req, res) => {
  try {
    const plantId = req.params.plantId;
    const { error } = await supabaseAdmin
      .from('user_plants')
      .delete()
      .eq('user_id', req.userId)
      .eq('plant_id', plantId);
    if (error) {
      console.error('❌ Supabase DELETE error (user_plants):', error);
      return res.status(500).json({ msg: 'Database error' });
    }
    return res.json({ msg: 'Removed' });
  } catch (err) {
    console.error('❌ /api/user-plants DELETE error:', err.stack || err);
    return res.status(500).json({ msg: 'Internal server error in user-plants DELETE' });
  }
});

// ─── 3) USER_TASKS CRUD (Supabase) ────────────────────────────────────────────
// GET /api/user-tasks
app.get('/api/user-tasks', auth, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_tasks')
      .select('id, plant_id, plant_name, task_type, due_date, created_at')
      .eq('user_id', req.userId)
      .order('due_date', { ascending: true });
    if (error) {
      console.error('❌ Supabase SELECT error (user_tasks):', error);
      return res.status(500).json({ msg: 'Database error' });
    }
    return res.json(data);
  } catch (err) {
    console.error('❌ /api/user-tasks GET error:', err.stack || err);
    return res.status(500).json({ msg: 'Internal server error in user-tasks GET' });
  }
});

// POST /api/user-tasks { plantId?, plantName, taskType, dueDate }
app.post('/api/user-tasks', auth, async (req, res) => {
  try {
    let { plantId, plantName, taskType, dueDate } = req.body;
    if (!taskType || !dueDate) {
      return res.status(400).json({ msg: 'taskType & dueDate required' });
    }
    // plantId and plantName are optional (free-text tasks allowed)
    if (!plantName && plantId) {
      // If only ID is given, we can set plantName later. For now assume front-end sent both
      plantName = '';
    }
    const { error } = await supabaseAdmin
      .from('user_tasks')
      .insert([{
        user_id:    req.userId,
        plant_id:   plantId || null,
        plant_name: plantName || null,
        task_type:  taskType,
        due_date:   dueDate
      }]);
    if (error) {
      console.error('❌ Supabase INSERT error (user_tasks):', error);
      return res.status(500).json({ msg: 'Database error' });
    }
    return res.json({ msg: 'Task created' });
  } catch (err) {
    console.error('❌ /api/user-tasks POST error:', err.stack || err);
    return res.status(500).json({ msg: 'Internal server error in user-tasks POST' });
  }
});

// DELETE /api/user-tasks/:taskId
app.delete('/api/user-tasks/:taskId', auth, async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const { error } = await supabaseAdmin
      .from('user_tasks')
      .delete()
      .eq('user_id', req.userId)
      .eq('id', taskId);
    if (error) {
      console.error('❌ Supabase DELETE error (user_tasks):', error);
      return res.status(500).json({ msg: 'Database error' });
    }
    return res.json({ msg: 'Task removed' });
  } catch (err) {
    console.error('❌ /api/user-tasks DELETE error:', err.stack || err);
    return res.status(500).json({ msg: 'Internal server error in user-tasks DELETE' });
  }
});

// ─── 4) WEATHER (OpenWeather One Call) ────────────────────────────────────────
// GET /api/weather?lat=<lat>&lon=<lon>
app.get('/api/weather', auth, async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ msg: 'lat & lon query required' });
    }
    // One Call v3: https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&appid={API key}&units=metric
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&appid=${encodeURIComponent(OPENWEATHER_API_KEY)}&units=metric`;
    const response = await axios.get(url, { timeout: 2000 });
    // Return only current weather and daily forecast for next 7 days
    const { current, daily } = response.data;
    return res.json({ current, daily: daily.slice(0, 7) });
  } catch (err) {
    console.error('❌ /api/weather error:', err.stack || err);
    return res.status(500).json({ msg: 'Weather fetch failed' });
  }
});

// ─── 5) CATCH-ALL → serve React build ─────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ─── Export for Vercel ────────────────────────────────────────────────────────
module.exports = serverless(app);

// ─── Local fallback (if not Vercel) ───────────────────────────────────────────
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
  });
}
