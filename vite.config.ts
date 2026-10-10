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
          if (id.includes('src/data/papers.json')) {
            return 'papers-data';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'lucide-icons';
          }
        },
      },
    },
  },
});
