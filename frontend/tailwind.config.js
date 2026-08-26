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
        dark: {
          DEFAULT: '#08090d',
          card: '#10121a',
          surface: '#151824',
          border: '#1f2433',
        },
        light: {
          DEFAULT: '#f8fafc',
          card: '#ffffff',
          surface: '#f1f5f9',
          border: '#e2e8f0',
        },
        brand: {
          cyan: '#06b6d4',
          pink: '#f43f5e',
          purple: '#8b5cf6',
          amber: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
        mono: ['"Space Grotesk"', 'monospace'],
      },
    },
  },
  plugins: [],
}
