/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // CSS-variable-backed so .dark / :root can redefine them — see index.css.
        // The rgb(var(--x) / <alpha-value>) pattern keeps Tailwind's opacity
        // modifiers (e.g. bg-card/60) working.
        bg:       "rgb(var(--color-bg) / <alpha-value>)",
        surface:  "rgb(var(--color-surface) / <alpha-value>)",
        card:     "rgb(var(--color-card) / <alpha-value>)",
        border:   "rgb(var(--color-border) / <alpha-value>)",
        teal:     "rgb(var(--color-teal) / <alpha-value>)",
        "teal-d": "rgb(var(--color-teal-d) / <alpha-value>)",
        lav:      "rgb(var(--color-lav) / <alpha-value>)",
        muted:    "rgb(var(--color-muted) / <alpha-value>)",
        ink:      "rgb(var(--color-ink) / <alpha-value>)", // primary text — replaces hardcoded text-white
      },
      fontFamily: {
        mono:    ["DM Mono", "monospace"],
        sans:    ["Inter", "sans-serif"],
        display: ["Syne", "sans-serif"], // headlines only
      },
      backdropBlur: {
        glass: "16px",
      },
      backgroundImage: {
        "aurora-dark":
          "radial-gradient(circle at 15% 10%, rgba(0,229,160,0.12), transparent 45%), radial-gradient(circle at 85% 0%, rgba(180,180,249,0.10), transparent 40%), radial-gradient(circle at 50% 100%, rgba(0,229,160,0.06), transparent 50%)",
        "aurora-light":
          "radial-gradient(circle at 15% 10%, rgba(0,150,110,0.07), transparent 45%), radial-gradient(circle at 85% 0%, rgba(99,91,219,0.06), transparent 40%)",
      },
    },
  },
  plugins: [],
};
