import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      overlay: true,
      protocol: 'ws',
      host: 'localhost',
      port: 5174
    },
    // Enable hot module replacement
    watch: {
      usePolling: true,
      interval: 100
    },
    // Force the server to be available on localhost
    host: 'localhost',
    port: 5174
  }
})
