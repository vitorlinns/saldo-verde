import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './pages/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecf9ed',
          100: '#d8f3d5',
          200: '#b3e7ab',
          300: '#82de7f',
          400: '#61c670',
          500: '#3d9f53',
          600: '#2f7b40',
          700: '#256034',
          800: '#1f4d29',
          900: '#17381e'
        },
        white: '#ffffff',
        black: '#171717'
      }
    }
  },
  plugins: []
};

export default config;
