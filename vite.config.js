import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    rollupOptions: {
      input: {
        admin: path.resolve(__dirname, 'public/index.html'),
        client: path.resolve(__dirname, 'public/client.html'),
      },
    },
  },
});
