import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "rgb(var(--brand-50) / <alpha-value>)",
          100: "rgb(var(--brand-100) / <alpha-value>)",
          400: "rgb(var(--brand-400) / <alpha-value>)",
          500: "rgb(var(--brand-500) / <alpha-value>)",
          600: "rgb(var(--brand-600) / <alpha-value>)",
          700: "rgb(var(--brand-700) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          bg: "rgb(var(--accent-bg) / <alpha-value>)",
          fg: "rgb(var(--accent-fg) / <alpha-value>)",
        },
        direct: {
          DEFAULT: "rgb(var(--direct) / <alpha-value>)",
          bg: "rgb(var(--direct-bg) / <alpha-value>)",
          fg: "rgb(var(--direct-fg) / <alpha-value>)",
        },
        bridge: {
          DEFAULT: "rgb(var(--bridge) / <alpha-value>)",
          bg: "rgb(var(--bridge-bg) / <alpha-value>)",
          fg: "rgb(var(--bridge-fg) / <alpha-value>)",
        },
        missing: {
          DEFAULT: "rgb(var(--missing) / <alpha-value>)",
          bg: "rgb(var(--missing-bg) / <alpha-value>)",
          fg: "rgb(var(--missing-fg) / <alpha-value>)",
        },
        review: {
          DEFAULT: "rgb(var(--review) / <alpha-value>)",
          bg: "rgb(var(--review-bg) / <alpha-value>)",
          fg: "rgb(var(--review-fg) / <alpha-value>)",
        },
        canvas: "rgb(var(--bg-canvas) / <alpha-value>)",
        "canvas-deep": "rgb(var(--bg-canvas-deep) / <alpha-value>)",
        "canvas-hi": "rgb(var(--bg-canvas-hi) / <alpha-value>)",
        surface: "rgb(var(--bg-surface) / <alpha-value>)",
        "surface-warm": "rgb(var(--bg-surface-warm) / <alpha-value>)",
        elevated: "rgb(var(--bg-elevated) / <alpha-value>)",
        code: "rgb(var(--bg-code) / <alpha-value>)",
        "border-subtle": "rgb(var(--border-subtle) / <alpha-value>)",
        "border-strong": "rgb(var(--border-strong) / <alpha-value>)",
        "border-warm": "rgb(var(--border-warm) / <alpha-value>)",
        "text-primary": "rgb(var(--text-primary) / <alpha-value>)",
        "text-secondary": "rgb(var(--text-secondary) / <alpha-value>)",
        "text-muted": "rgb(var(--text-muted) / <alpha-value>)",
        "text-inverse": "rgb(var(--text-inverse) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        "3xl": "var(--radius-3xl)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        glow: "var(--shadow-glow)",
        "glow-navy": "var(--shadow-glow-navy)",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        treeGrow: {
          "0%": { opacity: "0", transform: "scale(0.6)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgb(16 185 129 / 0.5)" },
          "50%": { boxShadow: "0 0 0 14px rgb(16 185 129 / 0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 300ms var(--ease-out) both",
        slideUp: "slideUp 400ms var(--ease-out) both",
        treeGrow: "treeGrow 600ms var(--ease-spring) both",
        pulseGlow: "pulseGlow 2.4s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;