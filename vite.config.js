import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        admin: 'public/index.html',     // para /
        client: 'public/client.html',   // para /client
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  publicDir: false,
});
