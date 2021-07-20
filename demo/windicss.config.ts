import { defineConfig } from 'windicss/helpers';
import typography from 'windicss/plugin/typography';
import windiColors from 'windicss/colors';

export const colors = {
  primary: {
    dark: 'rgba(187,134,252,0.7)',
    DEFAULT: 'rgba(187,134,252,0.7)',
    light: '#ccacf7'
  },
  secondary: '#03dac5',
  accent: '#6200ee',
  light: '#F2F2F2',
  gray: windiColors.coolGray,
  blue: windiColors.lightBlue,
  red: windiColors.rose,
  pink: windiColors.fuchsia
} as const;

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
  ]
});
