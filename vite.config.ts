import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: './',
  plugins: [vue()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api/dav': {
        target: 'https://dav.jianguoyun.com/dav',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api\/dav/, '')
      }
    }
  }
})
