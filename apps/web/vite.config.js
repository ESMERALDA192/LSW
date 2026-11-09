import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: {
      '/f0': 'http://127.0.0.1:8000',
      '/f5': 'http://127.0.0.1:8001',
      '/scenarios': 'http://127.0.0.1:8000',
      '/history': 'http://127.0.0.1:8000',
      '/storage': 'http://127.0.0.1:8000',
    },
  },
});
