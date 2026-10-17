/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFCFA',
          100: '#F8F5EF',
          200: '#F1EBE0',
          300: '#E5DCCB',
        },
        peach: {
          50: '#FBF3EA',
          100: '#F6E7D6',
          200: '#F0D9BE',
          300: '#E7C39A',
          400: '#DFB27E',
        },
        amber: {
          300: '#F2CE8E',
          400: '#EBB868',
          500: '#E3A54B',
          600: '#CE8B33',
        },
        espresso: {
          50: '#F5F0EA',
          100: '#E8DFD3',
          200: '#C9B9A2',
          400: '#7A6A56',
          500: '#5C4F3F',
          600: '#4A3E31',
          700: '#3A2F25',
          800: '#2B221A',
          900: '#231C15',
        },
      },
      fontFamily: {
        display: ['Newsreader', 'Iowan Old Style', 'Georgia', 'serif'],
        body: ['Manrope', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
