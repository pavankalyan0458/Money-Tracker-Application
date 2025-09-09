    /** @type {import('tailwindcss').Config} */
    module.exports = {
      darkMode: 'class', // <--- IMPORTANT: This line must be here
      content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html",
      ],
      theme: {
        extend: {
          fontFamily: {
            inter: ['Inter', 'sans-serif'],
          },
          keyframes: {
            'pulse-slow': {
              '0%, 100%': { transform: 'scale(1)', opacity: '0.1' },
              '50%': { transform: 'scale(1.1)', opacity: '0.2' },
            },
            'pulse-medium': {
              '0%, 100%': { transform: 'scale(1)', opacity: '0.15' },
              '50%': { transform: 'scale(1.08)', opacity: '0.25' },
            },
            'pulse-fast': {
              '0%, 100%': { transform: 'scale(1)', opacity: '0.2' },
              '50%': { transform: 'scale(1.05)', opacity: '0.3' },
            },
            'pulse-slowest': {
              '0%, 100%': { transform: 'scale(1)', opacity: '0.05' },
              '50%': { transform: 'scale(1.03)', opacity: '0.1' },
            },
          },
          animation: {
            'pulse-slow': 'pulse-slow 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            'pulse-medium': 'pulse-medium 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            'pulse-fast': 'pulse-fast 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            'pulse-slowest': 'pulse-slowest 10s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          },
        },
      },
      plugins: [],
    }
    