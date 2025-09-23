import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        brand: {
          DEFAULT: '#2563eb',
          muted: '#1d4ed8',
          foreground: '#f8fafc',
        },
        surface: {
          DEFAULT: '#0f172a',
          raised: '#1e293b',
          border: '#334155',
        },
      },
      boxShadow: {
        card: '0 10px 30px -12px rgba(15, 23, 42, 0.4)',
      },
    },
  },
  plugins: [],
};
