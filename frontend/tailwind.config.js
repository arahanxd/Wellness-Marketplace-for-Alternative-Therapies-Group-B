/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4fbf6',
          100: '#e4f5e9',
          200: '#c6e6d0',
          300: '#99d1ac',
          400: '#6ab685',
          500: '#429a64',
          600: '#307b4f',
          700: '#266140',
          800: '#1f4e35',
          900: '#193f2c',
        },
      },
      boxShadow: {
        'soft-card': '0 10px 30px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
}

