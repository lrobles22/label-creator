import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig(({ command }) => {
  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),      // Cliente
          admin: resolve(__dirname, 'admin.html'),     // Admin
          client: resolve(__dirname, 'client.html')    // Cliente separado
        }
      }
    },
    root: command === 'serve' ? '.' : undefined // esto permite que `npm run dev` funcione normalmente
  }
})
