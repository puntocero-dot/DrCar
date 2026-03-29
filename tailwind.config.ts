import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f3ff',
          100: '#dde3f5',
          200: '#b8c4eb',
          300: '#8fa3de',
          400: '#6680cf',
          500: '#4d66b8',
          600: '#1a2744',
          700: '#152036',
          800: '#0f1829',
          900: '#0a101c',
          950: '#060b13',
        },
        steel: {
          50: '#f5f7fa',
          100: '#ebeef3',
          200: '#d3dae5',
          300: '#adb9cc',
          400: '#8294af',
          500: '#627895',
          600: '#4d607c',
          700: '#3f4e65',
          800: '#374355',
          900: '#313a49',
          950: '#202630',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
        },
        success: '#22c55e',
        warning: '#eab308',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        base: ['1rem', '1.5rem'],
      },
    },
  },
  plugins: [],
}
export default config
