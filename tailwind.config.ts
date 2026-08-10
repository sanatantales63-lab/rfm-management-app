import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./features/**/*.{ts,tsx}"],
  theme: { extend: { colors: { ink: "#1d1a18", champagne: "#b99462", cream: "#faf8f5" }, fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"], display: ["Iowan Old Style", "Baskerville", "Georgia", "serif"] }, boxShadow: { soft: "0 16px 40px rgba(42, 34, 27, .08)", glow: "0 10px 30px rgba(185, 148, 98, .22)" } } },
  plugins: []
};
export default config;
