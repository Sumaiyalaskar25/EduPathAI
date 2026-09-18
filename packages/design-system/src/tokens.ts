export const colorTokens = {
  brand: {
    50: "250 245 255",
    100: "237 233 254",
    500: "139 92 246",
    600: "124 58 237",
    700: "109 40 217",
  },
  direct: { DEFAULT: "16 185 129", bg: "236 253 245" },
  bridge: { DEFAULT: "245 158 11", bg: "255 251 235" },
  missing: { DEFAULT: "244 63 94", bg: "255 241 242" },
  review: { DEFAULT: "100 116 139", bg: "241 245 249" },
  conflict: { DEFAULT: "217 70 239", bg: "253 244 255" },
  surface: {
    canvas: "250 250 250",
    surface: "255 255 255",
    elevated: "255 255 255",
    subtle: "226 232 240",
    strong: "203 213 225",
    primary: "15 23 42",
    secondary: "71 85 105",
    muted: "148 163 184",
  },
} as const;

export const spacingTokens = {
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  6: "1.5rem",
  8: "2rem",
  12: "3rem",
  16: "4rem",
} as const;

export const radiusTokens = {
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  full: "9999px",
} as const;

export const shadowTokens = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
  glow: "0 0 24px rgb(var(--brand-500) / 0.4)",
} as const;

export const typographyTokens = {
  fontSans: '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
  fontMono: '"JetBrains Mono", ui-monospace, "SF Mono", monospace',
  fontDisplay: '"Inter", "Cal Sans", system-ui, sans-serif',
} as const;

export const motionTokens = {
  easeOut: "cubic-bezier(0.16, 1, 0.3, 1)",
  easeSpring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  durationFast: "150ms",
  durationBase: "250ms",
  durationSlow: "500ms",
} as const;