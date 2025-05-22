/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        shine: 'shine 1s forwards',
        'pulse-slow': 'pulse-slow 3s infinite ease-in-out',
        'bounce-slow': 'bounce 2s infinite ease-in-out',
      },
      keyframes: {
        shine: {
          '0%': { 
            opacity: '0',
            transform: 'translateX(-100%)' 
          },
          '20%': { 
            opacity: '1' 
          },
          '100%': { 
            opacity: '0',
            transform: 'translateX(200%)' 
          },
        },
        'pulse-slow': {
          '0%, 100%': { 
            opacity: '1',
            boxShadow: '0 0 10px 2px rgba(59, 130, 246, 0.6), 0 0 20px 4px rgba(59, 130, 246, 0.4)'
          },
          '50%': { 
            opacity: '0.7',
            boxShadow: '0 0 15px 3px rgba(59, 130, 246, 0.8), 0 0 25px 5px rgba(59, 130, 246, 0.6)'
          },
        }
      },
    },
  },
  plugins: [],
}