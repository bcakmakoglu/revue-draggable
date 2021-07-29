import { defineConfig } from 'windicss/helpers';
import typography from 'windicss/plugin/typography';
import { colors } from './colors';

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
    include: ['index.html', 'example/**/*.{vue,html,jsx,tsx}', 'src/**/*']
  },
  // @ts-ignore
  safelist: [
    'grid',
    'grid-cols-2',
    'grid-cols-3',
    ...Object.keys(colors).map((color) => {
      const range = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      return range.map((num) => `bg-${color}-${num}00`);
    })
  ]
});
