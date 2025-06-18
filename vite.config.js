import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        admin: 'public/index.html',
        client: 'public/client.html',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  publicDir: false,
});
