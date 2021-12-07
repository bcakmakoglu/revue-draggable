import { resolve } from 'path'
import { defineConfig } from 'vite'
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
    minify: 'esbuild',
    emptyOutDir: false,
    lib: {
      formats: ['es', 'iife', 'cjs'],
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'revueDraggable'
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['vue', 'vue-demi'],
      output: {
        dir: './dist',
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: 'Vue',
          'vue-demi': 'VueDemi'
        }
      }
    }
  },
  plugins: [
    vue(),
    WindiCSS(),
    svgLoader(),
    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: ['vue-demi', '@vueuse/core'],
      dts: 'src/auto-imports.d.ts'
    })
  ],
  optimizeDeps: {
    include: ['vue', 'vue-demi', '@vueuse/core']
  }
})
