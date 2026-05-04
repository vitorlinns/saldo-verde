/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
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
        black: '#040404',
        gray: 'rgb(72, 72, 72)',
        background: '#040404',
        bg_saas: '#090909',
        card: '#1b1b1b',
        tab_sidebar: '#1f1f1f',
        btn_google: '#151515',
        surface: '#111111',
        border: '#b8b8b81d',
        danger: 'rgb(228, 106, 106)',
        danger_bg: 'rgba(248, 103, 103, 0.08)',
        success:'#82de7fdc',
        success_bg: '#82de7f21',
        warning: '#f4a639',
        warning_bg: '#f4a63941'

      },
      fontFamily: {
        sans: ['Funnel Display', 'Inter', 'system-ui', 'sans-serif'],
      }
    }
  },
  plugins: []
};
