import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      // wrangler dev serves the worker (with /api routes) on 8787
      '/api': 'http://localhost:8787',
    },
  },
});
