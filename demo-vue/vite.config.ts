import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // 识别 ui- 前缀的自定义元素（Web Components）
          isCustomElement: (tag) => tag.startsWith('ui-')
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // 开发时直接引用源码入口
      '@aspect/creator-ui-kit': resolve(__dirname, '../src/index.js'),
      '@aspect/creator-ui-kit/vue': resolve(__dirname, '../src/cc'),
      '@aspect/creator-ui-kit/style.css': resolve(__dirname, '../dist/style.css')
    }
  },
  server: {
    port: 3001
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: ['vue'],
    // 排除本地链接的包，让它实时编译
    exclude: ['@aspect/creator-ui-kit']
  }
})
