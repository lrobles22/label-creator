import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: '/client.html', // ⬅️ Esto abre directamente el panel cliente
    historyApiFallback: false, // ⬅️ No usar redirección
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'), // Admin
        client: path.resolve(__dirname, 'client.html') // Cliente
      }
    }
  }
});
