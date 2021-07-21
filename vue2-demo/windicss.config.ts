import { defineConfig } from 'windicss/helpers';
import typography from 'windicss/plugin/typography';
import { colors } from '../example/colors';

export default defineConfig({
  theme: {
    extend: {
      colors
    }
  },
  darkMode: 'media',
  plugins: [
    typography({
      dark: true
    })
  ],
  safelist: ['grid', 'grid-cols-2', 'grid-cols-3']
});
