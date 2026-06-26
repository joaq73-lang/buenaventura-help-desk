/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Buenaventura brand palette
        bv: {
          teal:      '#1A7A6A',
          'teal-light': '#2A9A88',
          'teal-dark':  '#145F52',
          'teal-50':    '#EAF4F2',
          'teal-100':   '#C5E5E0',
          gray:      '#4A4A4A',
          'gray-mid':   '#7A7A7A',
          cream:     '#F5F0E8',
          'cream-dark': '#EDE6D8',
        },
        // Keep slate-dark alias
        'slate-dark': '#2F3640',
        // Legacy aliases for existing classes
        gold: {
          DEFAULT: '#1A7A6A',
          light:   '#2A9A88',
          dark:    '#145F52',
        },
        warm: {
          DEFAULT: '#F8F9FA',
          dark:    '#E9ECEF',
        },
        status: {
          active:       '#D4EDDA',
          activeText:   '#155724',
          critical:     '#F8D7DA',
          criticalText: '#721C24',
          warning:      '#FFF3CD',
          warningText:  '#856404',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
