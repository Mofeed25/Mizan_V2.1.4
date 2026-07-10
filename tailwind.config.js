/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'Tajawal', 'system-ui', 'sans-serif'],
        display: ['Tajawal', 'Cairo', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eff9ff',
          100: '#dcf2ff',
          200: '#b3e5ff',
          300: '#75d0ff',
          400: '#2cb8ff',
          500: '#029dff',
          600: '#007ad8',
          700: '#0061ae',
          800: '#05518c',
          900: '#0a4374',
          950: '#062a4d',
        },
        aqua: {
          50: '#ecfdfc',
          100: '#cffbf7',
          200: '#9ff6ee',
          300: '#5eecdf',
          400: '#25d8d8',
          500: '#0bbac0',
          600: '#08979e',
          700: '#0d787f',
          800: '#115f66',
          900: '#134e54',
        },
        sand: {
          50: '#faf8f3',
          100: '#f3ede0',
          200: '#e6d8bd',
          300: '#d4bd90',
          400: '#c2a06a',
          500: '#b08951',
          600: '#946e44',
          700: '#78573a',
          800: '#614832',
          900: '#503c2c',
        },
        risk: {
          high: '#dc2626',
          med: '#f59e0b',
          stable: '#16a34a',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
        cardlg: '0 10px 30px -12px rgba(15, 23, 42, 0.18), 0 4px 10px -6px rgba(15, 23, 42, 0.08)',
        glow: '0 0 0 1px rgba(2, 157, 255, 0.15), 0 8px 24px -8px rgba(2, 157, 255, 0.25)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.95)', opacity: '0.7' },
          '70%': { transform: 'scale(1.1)', opacity: '0' },
          '100%': { transform: 'scale(1.1)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};
