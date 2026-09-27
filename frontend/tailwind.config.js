/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#F6F1E7',
          soft: '#FBF8F1',
          warm: '#EFE9DC',
          dark: '#E5DDCB',
        },
        primary: {
          DEFAULT: '#17458C',
          dark: '#032673',
          light: '#3766A5',
          600: '#0349AC',
          500: '#0375DE',
        },
        sky: {
          DEFAULT: '#05B6F3',
          soft: '#ACD8EA',
          ice: '#E5F5FA',
        },
        gold: {
          DEFAULT: '#DDAD4B',
          light: '#E8C978',
          soft: '#F5E8C5',
          dark: '#C89032',
        },
        brown: {
          DEFAULT: '#98735C',
          dark: '#6B4634',
          soft: '#E8D8CB',
        },
        sahayak: {
          text: '#18304A',
          secondary: '#5F6B76',
          muted: '#89929A',
          disabled: '#B7BAB9',
          success: '#3F8F68',
          successSoft: '#DCEFE5',
          warning: '#C89032',
          warningSoft: '#F5E8C5',
          error: '#B84F45',
          errorSoft: '#F3DEDA',
          info: '#05B6F3',
        }
      },
      fontFamily: {
        heading: ['Manrope', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neu-flat': '4px 4px 10px rgba(184, 168, 145, 0.35), -3px -3px 8px rgba(255, 255, 255, 0.95)',
        'neu-sm': '2px 2px 5px rgba(184, 168, 145, 0.3), -2px -2px 5px rgba(255, 255, 255, 0.9)',
        'neu-card': '5px 6px 14px rgba(180, 164, 140, 0.28), -4px -4px 10px rgba(255, 255, 255, 0.95)',
        'neu-pressed': 'inset 3px 3px 6px rgba(184, 168, 145, 0.35), inset -2px -2px 5px rgba(255, 255, 255, 0.9)',
        'neu-gold': '0 4px 14px rgba(221, 173, 75, 0.35)',
        'neu-blue': '0 4px 14px rgba(3, 38, 115, 0.25)',
        'neu-glow': '0 0 16px rgba(5, 182, 243, 0.4)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      }
    },
  },
  plugins: [],
}
