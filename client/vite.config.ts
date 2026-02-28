import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import fs from 'node:fs';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, '../', '');
  const isDev = command === 'serve';

  return {
    plugins: [react()],
    envDir: '../',
    resolve: {
      dedupe: ['react', 'react-dom','socket.io-client'],
    },

    // production build config
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false, // disable for production
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router'],
            socket: ['socket.io-client'],
            ui: ['lucide-react']
          }
        }
      }
    },

    // only apply dev server config in development
    ...(isDev && {
      server: {
        port: parseInt(env.CLIENT_PORT),
        https: {
          key: fs.readFileSync(`${env.SSL_KEY_PATH}`),
          cert: fs.readFileSync(`${env.SSL_CERT_PATH}`),
        },
        proxy: {
          '/api': {
            target: `https://${env.SERVER_HOST}:${env.SERVER_PORT}`,
            secure: false,
          },
          '/socket.io': {
            target: `https://${env.SERVER_HOST}:${env.SERVER_PORT}`,
            ws: true,
            secure: false,
          },
        },
      }
    })
  }
})
