// src/components/layout/Navbar.jsx
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { path: "/", label: "Home" },
  { path: "/explorer", label: "Explorer" },
  { path: "/rankings", label: "Rankings" },
  { path: "/outbreaks", label: "Outbreaks" },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav
      className="fixed top-3 left-3 right-3 z-50 h-14 flex items-center px-5 gap-4 rounded-2xl border backdrop-blur-glass"
      style={{
        background: "rgb(var(--color-card) / var(--card-alpha))",
        borderColor: "rgb(var(--color-border) / 0.08)",
        boxShadow: "var(--card-shadow)",
      }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 font-display font-extrabold text-lg mr-4">
        <span
          className="w-2 h-2 rounded-full"
          style={{
            background: "linear-gradient(135deg, rgb(var(--color-teal)), rgb(var(--color-lav)))",
            boxShadow: "0 0 10px rgb(var(--color-teal) / 0.6)",
          }}
        />
        <span className="text-ink">GeoQuery</span>
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-1">
        {navLinks.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            className="px-3 py-1.5 rounded-lg text-sm font-mono transition-colors"
            style={
              location.pathname === path
                ? {
                  color: "rgb(var(--color-teal))",
                  background: "rgb(var(--color-teal) / 0.1)",
                  border: "1px solid rgb(var(--color-teal) / 0.3)",
                }
                : { color: "rgb(var(--color-muted))" }
            }
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Right — theme toggle + API status */}
      <div className="ml-auto flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-mono" style={{ color: "rgb(var(--color-muted))" }}>
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "rgb(var(--color-teal))" }}
          />
          GraphQL API
        </div>
        <div className="flex items-center gap-2 text-xs font-mono" style={{ color: "rgb(var(--color-muted))" }}>
          Change Mode
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
