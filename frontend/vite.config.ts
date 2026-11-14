import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const API_TARGET = process.env.VITE_API_PROXY ?? 'http://localhost:4000';

// Tailwind runs through PostCSS (postcss.config.js + tailwind.config.js) with the SAME versions as
// legacy/web, so the ported screens render exactly like the prototype (Tailwind 4 changed colours).
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Compile the shared contracts from source -> instant HMR when a schema changes
      '@homecare/shared': fileURLToPath(
        new URL('../packages/shared/src/index.ts', import.meta.url),
      ),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 3020,
    strictPort: true,
    // Same-origin in dev, exactly like production behind Nginx: /api -> API.
    // This is what lets the refresh-token cookie be SameSite=Strict.
    proxy: {
      '/api': { target: API_TARGET, changeOrigin: false },
      '/socket.io': { target: API_TARGET, ws: true },
    },
  },
  preview: { host: '127.0.0.1', port: 3020, strictPort: true },
  build: { sourcemap: true },
});
