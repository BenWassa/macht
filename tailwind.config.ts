import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#111210",
        surface: {
          1: "#181917",
          2: "#20211e",
          3: "#292a26",
        },
        inset: "#0c0d0c",
        text: {
          DEFAULT: "#f3f1e9",
          secondary: "#b9b7af",
          muted: "#96948d",
          disabled: "#5d5d58",
        },
        signal: {
          DEFAULT: "#f06a4b",
          strong: "#ff7958",
          soft: "#3b211b",
        },
        positive: "#63c59c",
        caution: "#d8aa52",
        negative: "#e07171",
        info: "#7e9ee8",
        divider: "#33342f",
        canvas: "#0c0c0c",
        well: "#080808",
        edge: "#1a1a1a",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      borderRadius: {
        sm: "0.5rem",
        md: "0.875rem",
        lg: "1.25rem",
      },
      boxShadow: {
        card: "0 1px 0 rgb(255 255 255 / 0.025), 0 12px 32px rgb(0 0 0 / 0.2)",
        raised: "0 1px 0 rgb(255 255 255 / 0.04), 0 18px 42px rgb(0 0 0 / 0.28)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        riseIn: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 160ms ease-out",
        riseIn: "riseIn 220ms cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
    },
  },
} satisfies Config;
