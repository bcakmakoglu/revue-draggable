import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import WindiCSS from 'vite-plugin-windicss'
import svgLoader from 'vite-svg-loader'
import AutoImport from 'unplugin-auto-import/vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'build'
  },
  resolve: {
    alias: {
      '~/': `${resolve(__dirname, 'src')}/`
    }
  },
  plugins: [
    vue(),
    WindiCSS(),
    svgLoader(),
    AutoImport({
      imports: ['vue-demi', '@vueuse/core'],
      dts: 'src/auto-imports.d.ts'
    })
  ]
})
