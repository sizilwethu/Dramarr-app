import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    host: true, // Needed for mobile testing via IP
  },
  define: {
    // Defines process.env as an empty object for libraries that might try to access it
    'process.env': {}
  }
});