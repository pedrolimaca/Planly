import { publicContentMiddleware } from './server/publicContentMiddleware';
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const key = loadEnv(mode, process.cwd(), 'YOUTUBE_').YOUTUBE_API_KEY;
  if(key) process.env.YOUTUBE_API_KEY = key;
  return {
  plugins: [react(), { name: 'planly-public-content', configureServer(server) { server.middlewares.use(publicContentMiddleware); }, configurePreviewServer(server) { server.middlewares.use(publicContentMiddleware); } }],
};
})
