// src/components/layout/ThemeToggle.jsx
import { useSelector, useDispatch } from "react-redux";
import { selectTheme, toggleTheme } from "../../features/ui/uiSlice";

export default function ThemeToggle() {
  const theme = useSelector(selectTheme);
  const dispatch = useDispatch();
  const isDark = theme === "dark";

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      aria-label="Toggle dark mode"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative w-10 h-[22px] rounded-full border transition-colors flex-shrink-0"
      style={{
        borderColor: "rgb(var(--color-border) / 0.5)",
        background: isDark ? "rgb(255 255 255 / 0.08)" : "rgb(0 0 0 / 0.06)",
      }}
    >
      <span
        className="absolute top-[2px] w-4 h-4 rounded-full transition-all"
        style={{
          left: isDark ? "21px" : "2px",
          background: isDark ? "rgb(var(--color-teal))" : "rgb(var(--color-lav))",
          boxShadow: isDark
            ? "0 0 8px rgb(var(--color-teal) / 0.7)"
            : "0 0 6px rgb(var(--color-lav) / 0.5)",
        }}
      />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
