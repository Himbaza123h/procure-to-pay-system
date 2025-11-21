/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5B4002',
          dark: '#4a3302',
          light: '#8B6002',
        },
        dark: {
          bg: '#1a252f',
          card: '#2C3E50',
          border: '#374151',
        }
      },
    },
  },
  plugins: [],
}