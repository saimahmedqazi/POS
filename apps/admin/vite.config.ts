import {
  defineConfig,
} from 'vite';

import react from '@vitejs/plugin-react';

import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  // GitHub Pages deploys at /POS/ — this ensures assets load correctly
  base: '/POS/',

  server: {
    host: true,
    port: 5174,
  },
});