/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        powerOn: {
          '0%': { opacity: '0.5', transform: 'scale(0.95)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        powerOff: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0.5', transform: 'scale(0.95)' },
        },
        ledPulse: {
          '0%, 100%': { boxShadow: '0 0 8px #beff0a, 0 0 16px rgba(190, 255, 10, 0.6)' },
          '50%': { boxShadow: '0 0 12px #beff0a, 0 0 24px rgba(190, 255, 10, 0.8)' },
        },
        bootGlow: {
          '0%': { opacity: '0.3' },
          '50%': { opacity: '0.7' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        powerOn: 'powerOn 0.6s ease-out',
        powerOff: 'powerOff 0.4s ease-in forwards',
        ledPulse: 'ledPulse 1.5s ease-in-out infinite',
        bootGlow: 'bootGlow 1.2s ease-out',
      },
    },
  },
  plugins: [],
}

