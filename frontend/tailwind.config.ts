import defaultTheme from 'tailwindcss/defaultTheme'
import type { Config } from 'tailwindcss'

const { fontFamily } = defaultTheme

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark Obsidian Backbone
        obsidian: {
          950: '#030303', // Main background
          900: '#0A0A0A', // Surface
          800: '#121212', // Card background (solid fallback)
          700: '#1E1E1E', // Border lighter
        },
        // Primary Brand: Electric Gold
        gold: {
          400: '#FACC15', // Neon gold
          500: '#EAB308', // Standard gold
          600: '#CA8A04', // Deep gold
        },
        // Secondary: Cyber Purple
        purple: {
          500: '#A855F7',
          900: '#581C87',
        },
        // Functional
        success: '#4ADE80', // Neon green
        error: '#F87171',   // Soft red
        glass: {
          100: 'rgba(255, 255, 255, 0.03)',
          200: 'rgba(255, 255, 255, 0.08)',
          300: 'rgba(255, 255, 255, 0.12)',
        }
      },
      fontFamily: {
        heading: ['var(--font-geist-mono)', ...fontFamily.mono],
        sans: ['var(--font-geist-sans)', ...fontFamily.sans],
      },
      backgroundImage: {
        'glow-gradient': 'linear-gradient(135deg, rgba(250, 204, 21, 0.15) 0%, rgba(168, 85, 247, 0.05) 100%)',
        'glass-gradient': 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0) 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}

export default config
