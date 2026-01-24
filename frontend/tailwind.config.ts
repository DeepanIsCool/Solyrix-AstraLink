import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Cream Spectrum
        cream: {
          50: '#FDFBF7',
          100: '#F8F4ED',
          200: '#F0E6D6',
          300: '#E8D7BF',
        },
        // Brown Spectrum  
        brown: {
          50: '#F5F1ED',
          100: '#E8DED4',
          200: '#D4C2B0',
          300: '#B8997A',
          400: '#9C7D5E',
          500: '#7A5E45',
          600: '#5A442F',
          700: '#3D2E1F',
          800: '#2A1F14',
        },
        // Accent Colors
        gold: '#C4A574',
        success: '#8B9670',
        error: '#B47B6B',
        warning: '#D4A574',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
      borderRadius: {
        card: '12px',
        button: '8px',
        input: '6px',
      },
      boxShadow: {
        'premium-sm': '0 1px 2px rgba(122, 94, 69, 0.05)',
        'premium-md': '0 4px 6px rgba(122, 94, 69, 0.07)',
        'premium-lg': '0 10px 15px rgba(122, 94, 69, 0.1)',
        'premium-xl': '0 20px 25px rgba(122, 94, 69, 0.12)',
      },
    },
  },
  plugins: [],
}

export default config
