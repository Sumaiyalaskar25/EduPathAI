import type { Config } from "tailwindcss";
import { tailwindPreset } from "@edupathai/design-system";

const config: Config = {
  presets: [tailwindPreset],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
    "../../packages/design-system/src/**/*.{ts,tsx}",
  ],
};

export default config;