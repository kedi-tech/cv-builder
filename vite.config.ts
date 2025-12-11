import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://10.15.8.99:5003';
  
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api/payment': {
          target: 'https://n8n.kedi-tech.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/payment/, '/webhook/ab839d73-7e7f-415e-ba8d-b40613a48551'),
        },
        '/api/auth/updateCredit': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/auth/, '/api/v1/auth'),
        },
      },
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
