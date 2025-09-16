import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import fs from 'node:fs';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    https: {
      key: fs.readFileSync('../certs/key.pem'),
      cert: fs.readFileSync('../certs/cert.pem'),
    },
    proxy: {
      '/api': {
        target: 'https://localhost:3001',
        secure: false, // accept self-signed certs
      },
      '/socket.io': {
        target: 'https://localhost:3001',
        ws: true,
        secure: false,
      },
    },
  }
})
