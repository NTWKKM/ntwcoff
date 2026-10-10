import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Relative base path ensures deployment works seamlessly on GitHub Pages subpaths
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
