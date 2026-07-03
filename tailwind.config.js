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
          50: '#faf6f3',
          100: '#f3e8df',
          200: '#e7cdbd',
          300: '#d6ab91',
          400: '#be8261',
          500: '#6f4e37', // Rich Brown (#6F4E37)
          600: '#64432d',
          700: '#533522',
          800: '#432918',
          900: '#382012',
          950: '#1e0e07',
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
          50: '#20170f',  // Darkest text (mapped to dark-50 for body text)
          100: '#33281c', // Main headings
          205: '#3f3224',
          200: '#4a3c2c', // Subheadings
          300: '#6a5842', // Secondary body
          400: '#85735b', // Muted text
          500: '#a5947c', // Placeholders
          600: '#c4b59d', // Gray borders
          700: '#dfd3bf', // Sub-pixel borders
          800: '#e8dfd0', // Border accent
          900: '#f0eae1', // Card backdrop / light container
          950: '#f8f4ec', // Soft Cream / Beige background (#F8F4EC)
        },
      },
      fontFamily: {
        sans: ['Inter', 'Cairo', 'Poppins', 'Manrope', 'system-ui', 'sans-serif'],
        arabic: ['Cairo', 'Amiri', 'serif'],
        display: ['Outfit', 'Cairo', 'Poppins', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-islamic': 'linear-gradient(135deg, #fdfbf7 0%, #f8f4ec 50%, #f0eae1 100%)',
        'gradient-gold': 'linear-gradient(135deg, #c8a46b 0%, #a9874f 100%)',
        'gradient-emerald': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
          '0%': { boxShadow: '0 2px 8px rgba(111, 78, 55, 0.08)' },
          '100%': { boxShadow: '0 10px 30px rgba(111, 78, 55, 0.2)' },
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
        'glow-sm': '0 2px 8px rgba(111, 78, 55, 0.08)',
        'glow': '0 4px 20px rgba(111, 78, 55, 0.12)',
        'glow-lg': '0 10px 30px rgba(111, 78, 55, 0.16)',
        'glow-gold': '0 4px 20px rgba(200, 164, 107, 0.2)',
        'glass': '0 8px 32px rgba(51, 40, 28, 0.03)',
      },
    },
  },
  plugins: [],
}
