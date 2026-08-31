import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  server: {
    https: {
      key: './localhost-key.pem',
      cert: './localhost.pem'
    },
    host: true,
  },
  plugins: [vue()],
  base: '/piano-hero/dist/'
})
