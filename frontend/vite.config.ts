import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * @fileOverview Vite 构建配置
 * @description React 插件 + 开发服务器代理 + GitHub Pages 部署配置
 * @created 2026-07-14
 */
export default defineConfig({
  plugins: [react()],
  base: '/HeartwishBox/',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
