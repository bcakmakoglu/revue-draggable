import { defineConfig } from 'windicss/helpers';
import typography from 'windicss/plugin/typography';
import { colors } from './example/colors';

export default defineConfig({
  theme: {
    extend: {
      colors
    }
  },
  shortcuts: {
    'primary-gradient': 'bg-gradient-to-b from-accent-500 via-accent-700 to-accent-900'
  },
  darkMode: 'media',
  plugins: [
    typography({
      dark: true
    })
  ],
  extract: {
    include: ['index.html', 'example/**/*.{vue,html,jsx,tsx}']
  },
  safelist: ['grid', 'grid-cols-2', 'grid-cols-3']
});
