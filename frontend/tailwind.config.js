/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Bright Orange — primary actions, buttons, highlights
        orange: {
          DEFAULT: '#FF6B00',
          50:  '#FFF3E8',
          100: '#FFE0C2',
          200: '#FFBF85',
          300: '#FF9A47',
          400: '#FF7B1A',
          500: '#FF6B00',
          600: '#E05E00',
          700: '#B84D00',
          800: '#8F3C00',
          900: '#5C2700',
        },
        // Cobalt Blue — background, sidebar, cards
        cobalt: {
          DEFAULT: '#1A3A6B',
          50:  '#E8EEF8',
          100: '#C5D4ED',
          200: '#8AAAD9',
          300: '#5080C1',
          400: '#2A5BA8',
          500: '#1A3A6B',
          600: '#152F56',
          700: '#0F2241',
          800: '#0A172C',
          900: '#050D1A',
        },
        // Slate Blue — slightly lighter for cards/secondary elements
        slate: {
          DEFAULT: '#243B6E',
          50:  '#F0F3FA',
          100: '#D6DFEF',
          200: '#ADBFDF',
          300: '#839FCF',
          400: '#597FBF',
          500: '#3A5FA0',
          600: '#2D4A7D',
          700: '#243B6E',
          800: '#1A2C52',
          900: '#101C35',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'cobalt-gradient': 'linear-gradient(135deg, #0A172C 0%, #1A3A6B 50%, #243B6E 100%)',
        'orange-gradient': 'linear-gradient(135deg, #FF6B00 0%, #FF9A47 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(26,58,107,0.9) 0%, rgba(36,59,110,0.95) 100%)',
      },
      boxShadow: {
        'orange': '0 4px 24px rgba(255,107,0,0.35)',
        'cobalt': '0 4px 24px rgba(10,23,44,0.4)',
        'glow': '0 0 30px rgba(255,107,0,0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.35s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
