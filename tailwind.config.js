/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#faf7f2',
          100: '#f4ede2',
          200: '#e7d8c5',
          300: '#d7bea1',
          400: '#c29d78',
          500: '#ad7e53',
          600: '#946440',
          700: '#754d32',
          800: '#533725',
          900: '#342318',
          950: '#1a100b',
        },
        espresso: {
          800: '#1c1917',
          900: '#0c0a09',
          950: '#060504',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Sarabun',
          'sans-serif',
        ],
        serif: [
          'Merriweather',
          'Georgia',
          'serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
}
