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
        // Superr Style Reference Tokens
        'cream-paper': 'var(--color-cream-paper, #fdfbf9)',
        charcoal: 'var(--color-charcoal, #171717)',
        'cocoa-ink': 'var(--color-cocoa-ink, #2b1a07)',
        'true-black': 'var(--color-true-black, #000000)',
        'dew-drop': 'var(--color-dew-drop, #f7efe9)',
        'marker-orange': 'var(--color-marker-orange, #ff6f1e)',
        'burnt-sienna': 'var(--color-burnt-sienna, #ce500a)',
        'sky-sticker': 'var(--color-sky-sticker, #3b82f6)',
        'bubblegum-sticker': 'var(--color-bubblegum-sticker, #ff66cf)',
        'sprout-sticker': 'var(--color-sprout-sticker, #22c55e)',
        'shadow-mist': 'var(--color-shadow-mist, #bebcbb)',

        // Semantic / Backward Compatible Fallbacks
        'gallery-white': 'var(--color-cream-paper, #fdfbf9)',
        'studio-mist': 'var(--color-dew-drop, #f7efe9)',
        'paper-frost': 'var(--color-dew-drop, #f7efe9)',
        'hairline-silver': 'var(--color-border, #171717)',
        'control-gray': 'var(--color-dew-drop, #f7efe9)',
        ink: 'var(--color-cocoa-ink, #2b1a07)',
        slate: 'var(--color-charcoal, #171717)',
        steel: 'var(--color-charcoal, #171717)',
        'apple-blue': 'var(--color-marker-orange, #ff6f1e)',
        'pricing-blue': 'var(--color-charcoal, #171717)',
        'launch-orange': 'var(--color-marker-orange, #ff6f1e)',
      },
      fontFamily: {
        // Superr Fonts: gelica (Fraunces / Plus Jakarta Sans) + Geist (Inter)
        gelica: [
          'Fraunces',
          'Plus Jakarta Sans',
          'Sarabun',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        geist: [
          'Geist',
          'Inter',
          'Sarabun',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        // Aliases for layout compatibility
        'sf-display': [
          'Fraunces',
          'Plus Jakarta Sans',
          'Sarabun',
          'system-ui',
          'sans-serif',
        ],
        'sf-text': [
          'Inter',
          'Sarabun',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        sans: [
          'Inter',
          'Sarabun',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Geist Mono',
          'SF Mono',
          'ui-monospace',
          'monospace',
        ],
      },
      borderRadius: {
        tags: '20px',
        cards: '12px',
        card: '12px',
        footer: '56px',
        inputs: '8px',
        buttons: '20px',
        pill: '20px',
        button: '20px',
      },
      boxShadow: {
        card: 'rgba(0, 0, 0, 0.06) 0px 2px 20px 0px',
        subtle: 'rgba(0, 0, 0, 0.25) 0px 1px 2px 0px',
        'subtle-2': 'rgba(0, 0, 0, 0.15) 0px 1px 2px 0px',
        'paper-lift': 'rgba(0, 0, 0, 0.25) 0px 1px 2px 0px',
      },
    },
  },
  plugins: [],
}
