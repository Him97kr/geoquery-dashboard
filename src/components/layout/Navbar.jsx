// src/components/layout/Navbar.jsx
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { path: "/",          label: "Home" },
  { path: "/explorer",  label: "Explorer" },
  { path: "/rankings",  label: "Rankings" },
  { path: "/outbreaks", label: "Outbreaks" },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface border-b border-border h-14 flex items-center px-6 gap-4">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 font-mono font-bold text-teal text-lg mr-4">
        🌍 GeoQuery
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-1">
        {navLinks.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              location.pathname === path
                ? "bg-teal/10 text-teal border border-teal/30"
                : "text-muted hover:text-white"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Right — API status */}
      <div className="ml-auto flex items-center gap-2 text-xs text-muted font-mono">
        <span className="w-2 h-2 rounded-full bg-teal animate-pulse" />
        GraphQL API
      </div>
    </nav>
  );
}
