import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

const config: Config = {
  darkMode: ["class", "[data-mode='dark']"], // Use class strategy for dark mode
  theme: {
    extend: {
      // Define colors using CSS variables from globals.css
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: {
             DEFAULT: 'hsl(var(--sidebar-primary))',
             foreground: 'hsl(var(--sidebar-primary-foreground))',
          },
          accent: {
             DEFAULT: 'hsl(var(--sidebar-accent))',
             foreground: 'hsl(var(--sidebar-accent-foreground))',
          },
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        // Neutral gray palette from globals.css
        gray: {
          50: 'hsl(var(--gray-50))',
          100: 'hsl(var(--gray-100))',
          200: 'hsl(var(--gray-200))',
          300: 'hsl(var(--gray-300))',
          400: 'hsl(var(--gray-400))',
          500: 'hsl(var(--gray-500))',
          600: 'hsl(var(--gray-600))',
          700: 'hsl(var(--gray-700))',
          800: 'hsl(var(--gray-800))',
          900: 'hsl(var(--gray-900))',
          950: 'hsl(var(--gray-950))',
        },
      },
      borderRadius: {
        // Use CSS variables for border radius
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius)', // Default maps to 'md' in globals.css
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
        full: 'var(--radius-full)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        cal: ['var(--font-cal)'],
        mono: ['var(--font-jetbrains-mono)'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      // Add min-height/width from design system documentation
      minHeight: {
        '10': '2.5rem', // 40px
        '11': '2.75rem', // 44px
        '12': '3rem', // 48px
      },
      minWidth: {
        '10': '2.5rem',
        '11': '2.75rem',
        '12': '3rem',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)', // Simple small shadow
      },
      padding: {
        'safe': 'env(safe-area-inset-bottom)',
      },
      margin: {
        'safe': 'env(safe-area-inset-bottom)',
      }
    },
  },
  plugins: [
    // Add Tailwind plugins here if needed, e.g., typography, forms
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    // Define custom utilities based on globals.css @utility rules
    plugin(function({ addUtilities, theme }) {
      addUtilities({
        '.ds-section-title': {
          '@apply text-2xl sm:text-3xl font-black uppercase tracking-tight mb-2': {},
        },
        '.ds-section-subtitle': {
          '@apply text-xl font-bold mb-4': {},
        },
        '.ds-accent-bar': {
          '@apply h-1 w-16 bg-primary mb-4': {},
        },
        '.ds-card': {
           // Applied directly in card.tsx using cn() and base styles
           // Keeping it here doesn't hurt but isn't strictly necessary if components handle it
          '@apply bg-card border-2 border-border text-card-foreground rounded-xs transition-all duration-200 shadow-xs': {},
        },
        '.ds-button-primary': {
           // Applied directly in button.tsx using cn() and base styles
          '@apply bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 font-bold uppercase rounded-xs transition-all duration-200 min-h-11 md:min-h-10': {},
        },
        '.ds-button-secondary': {
           // Applied directly in button.tsx using cn() and base styles
          '@apply bg-secondary text-secondary-foreground hover:bg-secondary/90 active:bg-secondary/80 font-bold uppercase rounded-xs transition-all duration-200': {},
        },
        '.ds-button-outline': {
           // Applied directly in button.tsx using cn() and base styles
          '@apply bg-transparent border-2 border-primary text-primary hover:bg-primary/10 active:bg-primary/20 font-bold uppercase rounded-xs transition-all duration-200': {},
        },
        '.ds-focus-ring': {
          '@apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2': {},
        },
        '.ds-touch-target': {
          '@apply min-h-11 min-w-11': {},
        },
        '.pb-safe': {
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
        '.pt-safe': {
          paddingTop: 'env(safe-area-inset-top)',
        },
      })
    }),
  ],
}

export default config