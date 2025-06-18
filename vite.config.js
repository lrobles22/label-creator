import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        admin: resolve(__dirname, 'public/index.html'),
        client: resolve(__dirname, 'public/client.html'),
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  }
});
