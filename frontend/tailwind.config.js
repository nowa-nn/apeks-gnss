/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        header: {
          top: '#081E3E', // Deep corporate executive navy
        },
        brand: {
          DEFAULT: '#016C8A', // Brand turquoise
          dark: '#01556D',    // Hover dark turquoise
          light: '#E6F4F7',   // Light turquoise tint
        },
        neutral: {
          dark: '#172B4D',
          muted: '#6B778C',
          border: '#EBECF0',
          bg: '#FAFBFC',
        }
      }
    },
  },
  plugins: [],
}
