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
          50: '#f0fbf7',
          100: '#daf7ec',
          200: '#b7eed9',
          300: '#81deb9',
          400: '#47c595',
          500: '#004b39', // Deep Emerald Green (#004B39)
          600: '#003e2f',
          700: '#003126',
          800: '#00251d',
          900: '#001c15',
          950: '#000f0c',
        },
        gold: {
          50: '#faf7f0',
          100: '#f2ead3',
          200: '#e3d1a4',
          300: '#d3b674',
          400: '#c8a46b', // Gold (#C8A46B)
          500: '#a9874f',
          600: '#8b6d3a',
          700: '#6e532a',
          800: '#513c1e',
          900: '#3d2b15',
        },
        accent: {
          50: '#fdfbf6',
          100: '#f9f3e3',
          200: '#f2e4c1',
          300: '#e9cf9b',
          400: '#e6c587', // Warm Gold Accent (#E6C587)
          500: '#cca662',
          600: '#b38843',
          700: '#91692e',
          800: '#6f4e1f',
          900: '#523814',
        },
        dark: {
          50: '#0a100d',  // Darkest text/headings (very dark slate-green)
          100: '#15221b', // Main headings
          205: '#203227',
          200: '#2b3f33', // Subheadings
          300: '#4d6255', // Secondary body
          400: '#6c8174', // Muted text
          500: '#8c9f94', // Placeholders
          600: '#adbeb4', // Gray borders
          700: '#cedad3', // Sub-pixel borders
          800: '#eef3f0', // Border accent
          900: '#f4f8f6', // Card backdrop
          950: '#fafbf9', // Soft Sage Cream background
        },
      },
      fontFamily: {
        sans: ['Inter', 'Cairo', 'Poppins', 'Manrope', 'system-ui', 'sans-serif'],
        arabic: ['Cairo', 'Amiri', 'serif'],
        display: ['Outfit', 'Cairo', 'Poppins', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-islamic': 'linear-gradient(135deg, #fafbf9 0%, #f4f8f6 50%, #eef3f0 100%)',
        'gradient-gold': 'linear-gradient(135deg, #c8a46b 0%, #a9874f 100%)',
        'gradient-emerald': 'linear-gradient(135deg, #005a45 0%, #004b39 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 2px 8px rgba(0, 75, 57, 0.06)' },
          '100%': { boxShadow: '0 10px 30px rgba(0, 75, 57, 0.15)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'glow-sm': '0 2px 8px rgba(0, 75, 57, 0.06)',
        'glow': '0 4px 20px rgba(0, 75, 57, 0.08)',
        'glow-lg': '0 10px 30px rgba(0, 75, 57, 0.12)',
        'glow-gold': '0 4px 20px rgba(200, 164, 107, 0.2)',
        'glass': '0 8px 32px rgba(21, 34, 27, 0.02)',
      },
    },
  },
  plugins: [],
}
