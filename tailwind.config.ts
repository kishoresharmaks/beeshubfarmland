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
        forest: {
          DEFAULT: "#173F2B",
          deep: "#102E20",
          muted: "#E8EFE6",
        },
        cream: {
          DEFAULT: "#F7F4EB",
        },
        earth: {
          DEFAULT: "#A97843",
          light: "#C49560",
          soft: "#FBF6EE",
        },
        primary: {
          DEFAULT: "var(--color-primary)",
          dark: "#102E20",
        },
        cta: {
          DEFAULT: "var(--color-cta)",
          hover: "#102E20",
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
          accent: "#173F2B",
          hover: "#102E20",
          bg: "#FFFFFF",
          cream: "#F7F4EB",
          surface: "#FFFFFF",
          border: "#E2E8E2",
          text: "#202820",
          muted: "#6B756B",
          earth: "#A97843",
          sage: "#E8EFE6",
          success: "#173F2B",
        },
      },
      fontFamily: {
        serif: ["var(--font-heading)", "sans-serif"],
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        sans: ["var(--font-body)", "Inter", "sans-serif"],
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
