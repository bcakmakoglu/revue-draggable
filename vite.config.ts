import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import WindiCSS from 'vite-plugin-windicss';
import svgLoader from 'vite-svg-loader';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'build'
  },
  plugins: [WindiCSS(), svgLoader(), vue()]
});
