import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          dark: "#0E273E",
        },
        cta: {
          DEFAULT: "var(--color-cta)",
          hover: "#D02E00",
          soft: "var(--color-cta-soft)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          dark: "var(--color-accent-dark)",
          soft: "var(--color-accent-soft)",
          line: "var(--color-accent-line)",
        },
        surface: {
          DEFAULT: "var(--color-surface)",
          alt: "var(--color-surface-alt)",
        },
        ink: {
          DEFAULT: "var(--color-ink)",
          muted: "var(--color-ink-muted)",
        },
        line: {
          DEFAULT: "var(--color-line)",
        },
        chat: {
          DEFAULT: "var(--color-chat)",
        },
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
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        sans: ["var(--font-outfit)", "Inter", "sans-serif"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        hover: "var(--shadow-hover)",
      },
      maxWidth: {
        container: "var(--container)",
      },
    },
  },
  plugins: [],
};
export default config;
