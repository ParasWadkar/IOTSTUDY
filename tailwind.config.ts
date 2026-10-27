import type { Config } from 'tailwindcss';

const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: token('surface'),
        'surface-2': token('surface-2'),
        line: token('line'),
        'line-strong': token('line-strong'),
        ink: token('ink'),
        'ink-2': token('ink-2'),
        'ink-3': token('ink-3'),
        accent: token('accent'),
        'accent-hover': token('accent-hover'),
        'accent-ink': token('accent-ink'),
        'accent-soft': token('accent-soft'),
        'accent-text': token('accent-text'),
        ok: token('ok'),
        'ok-line': token('ok-line'),
        'ok-soft': token('ok-soft'),
        bad: token('bad'),
        'bad-line': token('bad-line'),
        'bad-soft': token('bad-soft'),
      },
      boxShadow: { card: 'var(--shadow-card)' },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: { fade: 'fadeIn 0.18s ease-out' },
    },
  },
  plugins: [],
};
export default config;
