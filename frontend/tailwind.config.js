/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        medical: {
          critical: '#dc2626',
          high: '#f59e0b',
          medium: '#3b82f6',
          low: '#10b981',
        }
      }
    },
  },
  plugins: [],
}
