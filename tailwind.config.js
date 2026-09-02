/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        background: '#000000',
        surface: {
          50: '#07080b',
          100: '#0c0e14',
          200: '#12151f',
          300: '#181d2a',
          400: '#22283a',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-active': 'rgba(255, 255, 255, 0.16)'
        }
      }
    },
  },
  plugins: [],
}
