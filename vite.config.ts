import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import WindiCSS from 'vite-plugin-windicss'
import svgLoader from 'vite-svg-loader'
import AutoImport from 'unplugin-auto-import/vite'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '~': resolve('src')
    },
    dedupe: ['vue'],
    extensions: ['.ts', '.vue']
  },
  build: {
    outDir: 'build'
  },
  plugins: [
    WindiCSS(),
    svgLoader(),
    vue(), // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: ['vue-demi', '@vueuse/core'],
      dts: 'src/auto-imports.d.ts'
    })
  ],
  optimizeDeps: {
    include: ['vue-demi', '@vueuse/core']
  }
})
