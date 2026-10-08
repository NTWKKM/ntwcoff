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
        eggshell: 'var(--color-eggshell, #fdfcfc)',
        'warm-taupe': 'var(--color-warm-taupe, #f5f3f1)',
        taupe: 'var(--color-warm-taupe, #f5f3f1)',
        stone: {
          DEFAULT: 'var(--color-stone, #ebe8e4)',
          50: '#fdfcfc',
          100: '#f5f3f1',
          200: '#ebe8e4',
          300: '#ded9d1',
          400: '#a59f97',
          500: '#777169',
          600: '#44403b',
          900: '#1c1a17',
        },
        ink: 'var(--color-ink, #000000)',
        graphite: 'var(--color-graphite, #44403b)',
        smoke: 'var(--color-smoke, #777169)',
        ash: 'var(--color-ash, #a59f97)',
        'violet-spark': 'var(--color-violet-spark, #0447ff)',
        'ember-orange': 'var(--color-ember-orange, #ff4704)',
        espresso: {
          800: '#1c1917',
          900: '#0c0a09',
          950: '#060504',
        },
      },
      fontFamily: {
        waldenburg: [
          'Waldenburg',
          'Inter',
          'Sarabun',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        sans: [
          'Inter',
          'Sarabun',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
        mono: [
          'Geist Mono',
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'monospace',
        ],
      },
      letterSpacing: {
        whisper: '-0.02em',
        tightest: '-0.02em',
        body: '0.01em',
      },
      borderRadius: {
        card: '20px',
        'card-lg': '24px',
        pill: '9999px',
      },
      boxShadow: {
        subtle: 'rgba(0, 0, 0, 0.4) 0px 0px 1px 0px, rgba(0, 0, 0, 0.04) 0px 1px 1px 0px, rgba(0, 0, 0, 0.04) 0px 2px 4px 0px',
        'subtle-inset': 'rgba(0, 0, 0, 0.075) 0px 0px 0px 0.5px inset',
        'subtle-stone': 'rgb(235, 232, 228) 0px 0px 0px 0.5px inset',
        'whisper-shadow': 'rgba(0, 0, 0, 0.04) 0px 1px 3px 0px, rgba(0, 0, 0, 0.02) 0px 0px 0px 1px',
      },
    },
  },
  plugins: [],
}
