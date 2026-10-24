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
        'cream-paper': 'var(--color-cream-paper, #fdfbf9)',
        charcoal: 'var(--color-charcoal, #171717)',
        'cocoa-ink': 'var(--color-cocoa-ink, #2b1a07)',
        'dew-drop': 'var(--color-dew-drop, #f7efe9)',
        'marker-orange': 'var(--color-marker-orange, #ff6f1e)',
        'burnt-sienna': 'var(--color-burnt-sienna, #ce500a)',
      },
      fontFamily: {
        gelica: [
          'Fraunces',
          'Plus Jakarta Sans',
          'Sarabun',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        geist: [
          'Plus Jakarta Sans',
          'Sarabun',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        sans: [
          'Plus Jakarta Sans',
          'Sarabun',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'monospace',
        ],
      },
      boxShadow: {
        card: 'rgba(0, 0, 0, 0.06) 0px 2px 20px 0px',
        subtle: 'rgba(0, 0, 0, 0.25) 0px 1px 2px 0px',
      },
    },
  },
  plugins: [],
}
