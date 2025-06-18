import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        admin: resolve(__dirname, 'public/index.html'),
        client: resolve(__dirname, 'public/client.html')
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  }
});
