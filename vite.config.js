// vite.config.js
import { defineConfig } from 'vite';
import react        from '@vitejs/plugin-react';

// DEBUG: Build-time logs (remove after verifying env vars)
console.log('🔍 BUILD-TIME VITE_SUPABASE_URL      =', process.env.VITE_SUPABASE_URL);
console.log('🔍 BUILD-TIME VITE_SUPABASE_ANON_KEY =', process.env.VITE_SUPABASE_ANON_KEY);
console.log('🔍 BUILD-TIME VITE_TREFLE_API_TOKEN  =', process.env.VITE_TREFLE_API_TOKEN);
console.log('🔍 BUILD-TIME VITE_OPENWEATHER_API_KEY =', process.env.VITE_OPENWEATHER_API_KEY);

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:3000"
    }
  },
  build: {
    outDir: "dist"
  }
});
