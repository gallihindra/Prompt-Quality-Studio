import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17201B",
        paper: "#F6F7F2",
        line: "#DDE1D9",
        leaf: {
          50: "#EEF4ED",
          100: "#DCE9D9",
          500: "#557A57",
          600: "#426545",
          700: "#334F36",
          900: "#243B28"
        },
        amber: "#C99741"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(23, 32, 27, 0.08)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
