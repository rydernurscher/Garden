// src/api/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be provided');
}

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      // 1) Persist session (access + refresh tokens) in localStorage
      persistSession: true,
      // 2) If Supabase ever redirects you back with ?access_token=…&refresh_token=…, read it
      detectSessionInUrl: true
    }
  }
);
