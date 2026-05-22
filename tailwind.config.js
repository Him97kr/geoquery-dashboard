/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg:      "#07090f",
        surface: "#0d1117",
        card:    "#111827",
        border:  "#1f2937",
        teal:    "#00e5a0",
        "teal-d":"#00a06e",
        lav:     "#b4b4f9",
        muted:   "#6b7280",
      },
      fontFamily: {
        mono: ["DM Mono", "monospace"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
