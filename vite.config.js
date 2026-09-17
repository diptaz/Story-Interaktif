import { defineConfig } from 'vite';

export default defineConfig({
  server: { port: 5190 },
  build: {
    // three.js + gsap memang besar (~200 KB gzip); tidak perlu diperingatkan
    chunkSizeWarningLimit: 900,
  },
});
