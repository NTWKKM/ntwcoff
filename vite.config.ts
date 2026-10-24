import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Prevent Vite CLI from exiting immediately when stdin is closed (/dev/null) in non-TTY container environments
if (!process.stdin.isTTY) {
  process.env.CI = 'true';
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Relative base path ensures deployment works seamlessly on GitHub Pages subpaths
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
    hmr: process.env.DISABLE_HMR !== 'true',
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/');
          if (normalizedId.includes('src/data/papers.json')) {
            return 'papers-data';
          }
          if (normalizedId.includes('node_modules/lucide-react')) {
            return 'lucide-icons';
          }
        },
      },
    },
  },
});
