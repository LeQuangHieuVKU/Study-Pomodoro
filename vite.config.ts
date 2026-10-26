import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) {
            return 'vendor-three';
          }
          if (
            id.includes('node_modules/react-player') ||
            id.includes('video-element') ||
            id.includes('hls.js') ||
            id.includes('dashjs')
          ) {
            return 'vendor-player';
          }
          if (
            id.includes('node_modules/@ionic/react') ||
            id.includes('node_modules/@ionic/react-router') ||
            id.includes('node_modules/ionicons')
          ) {
            return 'vendor-ionic';
          }
        },
      },
    },
  },
})
