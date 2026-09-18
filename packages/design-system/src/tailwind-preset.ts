import type { Config } from "tailwindcss";

export const tailwindPreset: Partial<Config> = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "rgb(var(--brand-50) / <alpha-value>)",
          100: "rgb(var(--brand-100) / <alpha-value>)",
          500: "rgb(var(--brand-500) / <alpha-value>)",
          600: "rgb(var(--brand-600) / <alpha-value>)",
          700: "rgb(var(--brand-700) / <alpha-value>)",
        },
        direct: {
          DEFAULT: "rgb(var(--direct) / <alpha-value>)",
          bg: "rgb(var(--direct-bg) / <alpha-value>)",
        },
        bridge: {
          DEFAULT: "rgb(var(--bridge) / <alpha-value>)",
          bg: "rgb(var(--bridge-bg) / <alpha-value>)",
        },
        missing: {
          DEFAULT: "rgb(var(--missing) / <alpha-value>)",
          bg: "rgb(var(--missing-bg) / <alpha-value>)",
        },
        review: {
          DEFAULT: "rgb(var(--review) / <alpha-value>)",
          bg: "rgb(var(--review-bg) / <alpha-value>)",
        },
        conflict: {
          DEFAULT: "rgb(var(--conflict) / <alpha-value>)",
          bg: "rgb(var(--conflict-bg) / <alpha-value>)",
        },
        canvas: "rgb(var(--bg-canvas) / <alpha-value>)",
        surface: "rgb(var(--bg-surface) / <alpha-value>)",
        elevated: "rgb(var(--bg-elevated) / <alpha-value>)",
        subtle: "rgb(var(--border-subtle) / <alpha-value>)",
        strong: "rgb(var(--border-strong) / <alpha-value>)",
        primary: "rgb(var(--text-primary) / <alpha-value>)",
        secondary: "rgb(var(--text-secondary) / <alpha-value>)",
        muted: "rgb(var(--text-muted) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
        display: ["var(--font-display)"],
      },
      boxShadow: {
        glow: "var(--shadow-glow)",
      },
      transitionTimingFunction: {
        out: "var(--ease-out)",
        spring: "var(--ease-spring)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s var(--ease-out)",
        "slide-up": "slideUp 0.4s var(--ease-out)",
        "tree-grow": "treeGrow 0.8s var(--ease-spring)",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        treeGrow: {
          "0%": { opacity: "0", transform: "scale(0.6)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgb(var(--brand-500) / 0.4)" },
          "50%": { boxShadow: "0 0 0 12px rgb(var(--brand-500) / 0)" },
        },
      },
    },
  },
  plugins: [],
};