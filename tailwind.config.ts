import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          accent: "#ED3500",
          hover: "#D02E00",
          bg: "#FFFCFB",
          surface: "#FFFFFF",
          border: "#E8EDF2",
          text: "#163B5C",
          muted: "#64748B",
          success: "#10B981",
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
