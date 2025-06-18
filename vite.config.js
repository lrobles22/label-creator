import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        client: resolve(__dirname, 'client.html'),
      }
    }
  }
});
