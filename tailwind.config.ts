import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#181A2A",
        paper: "#F6F7FB",
        line: "#DDE1EC",
        leaf: {
          50: "#F2F3FF",
          100: "#E4E7FF",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          900: "#252052"
        },
        amber: "#C98A34",
        success: {
          50: "#ECF8F1",
          100: "#D8F0E2",
          600: "#27845A",
          700: "#1E6847"
        }
      },
      boxShadow: {
        soft: "0 20px 55px rgba(42, 47, 94, 0.10)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
