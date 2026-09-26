/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design System - Light Theme (Default)
        bg: {
          primary: '#F8FAFC',      // slate-50
          surface: '#FFFFFF',       // white
          elevated: '#F1F5F9',      // slate-100
        },
        border: {
          subtle: '#E2E8F0',        // slate-200
          emphasis: '#CBD5E1',      // slate-300
        },
        text: {
          primary: '#0F172A',       // slate-950
          secondary: '#334155',     // slate-700
          muted: '#64748B',         // slate-500
        },
        brand: {
          primary: '#1E3A8A',       // blue-900 - Trust, stability
          'primary-hover': '#1E40AF', // blue-800
          accent: '#059669',        // emerald-600 - Growth, profit
          'accent-hover': '#047857',  // emerald-700
          warning: '#D97706',       // amber-600
          danger: '#DC2626',        // red-600
          info: '#0284C7',          // sky-600
        },
        // Legacy support (will be phased out)
        odoo: {
          purple: '#714B67',
          darkPurple: '#53344b',
          teal: '#017E84',
          darkTeal: '#005d62',
          gray: '#f9fafb',
          border: '#e5e7eb',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'display': ['44px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'h1': ['32px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '800' }],
        'h2': ['24px', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '700' }],
        'h3': ['20px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '1.5', letterSpacing: '-0.005em', fontWeight: '400' }],
        'body': ['14px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '500' }],
        'micro': ['11px', { lineHeight: '1.4', letterSpacing: '0.02em', fontWeight: '600' }],
      },
      spacing: {
        '0': '0',
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
        '9': '36px',
        '10': '40px',
        '11': '44px',
        '12': '48px',
        '14': '56px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '14px',
        'xl': '18px',
        '2xl': '24px',
        'full': '9999px',
      },
      boxShadow: {
        'xs': '0 1px 2px rgb(0 0 0 / 0.03)',
        'sm': '0 1px 3px rgb(0 0 0 / 0.05)',
        'md': '0 4px 12px rgb(0 0 0 / 0.08)',
        'lg': '0 12px 24px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 40px rgb(0 0 0 / 0.12)',
        'inner-sm': 'inset 0 1px 2px rgb(0 0 0 / 0.03)',
      },
      transitionDuration: {
        'fast': '120ms',
        'base': '200ms',
        'slow': '300ms',
      },
      transitionTimingFunction: {
        'standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'emphasized': 'cubic-bezier(0.2, 0, 0, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-right': 'slideInRight 250ms cubic-bezier(0.2, 0, 0, 1)',
        'slide-in-left': 'slideInLeft 250ms cubic-bezier(0.2, 0, 0, 1)',
        'slide-in-bottom': 'slideInBottom 250ms cubic-bezier(0.2, 0, 0, 1)',
        'scale-in': 'scaleIn 150ms cubic-bezier(0.2, 0, 0, 1)',
        'pulse-soft': 'pulseSoft 1500ms cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 1.5s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInBottom: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}
