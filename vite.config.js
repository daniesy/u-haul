import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(), dts()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, "src/index.js"),
      formats: ['es'],
      name: "UHaul"
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          Vue: 'vue'
        }
      }
    }
  }
})
