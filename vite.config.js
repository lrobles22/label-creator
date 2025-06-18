import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        admin: 'public/index.html',
        client: 'public/client.html',
      }
    }
  }
});
