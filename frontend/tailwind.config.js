/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#172026',
          light: '#22303a',
          lighter: '#314452'
        },
        coral: {
          DEFAULT: '#e96f51',
          hover: '#f48664',
          dark: '#d35a3c',
          light: '#fdf2ef'
        },
        sand: {
          DEFAULT: '#f4efe7',
          light: '#faf7f2',
          dark: '#e8dfd2'
        },
        mist: {
          DEFAULT: '#e4ebe7',
          dark: '#cedbd3'
        }
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['DM Sans', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 2px 15px -3px rgba(23, 32, 38, 0.05), 0 4px 6px -2px rgba(23, 32, 38, 0.03)',
        card: '0 10px 30px -4px rgba(23, 32, 38, 0.08), 0 4px 10px -2px rgba(23, 32, 38, 0.04)',
        glow: '0 0 25px -5px rgba(233, 111, 81, 0.35)'
      },
      animation: {
        shimmer: 'shimmer 2s infinite'
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' }
        }
      }
    }
  },
  plugins: []
};
