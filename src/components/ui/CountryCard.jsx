// src/components/ui/CountryCard.jsx
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setSelectedCountry } from "../../features/countries/countriesSlice";

function fmt(n) {
  if (!n && n !== 0) return "N/A";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toLocaleString();
}

export default function CountryCard({ country }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  function handleClick() {
    dispatch(setSelectedCountry(country));
    navigate(`/country/${country.code}`);
  }

  return (
    <button
      onClick={handleClick}
      className="card border border-border hover:border-teal/40 transition-all text-left w-full group"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{country.flag || "🌍"}</span>
        <div>
          <p className="font-semibold text-white group-hover:text-teal transition-colors">
            {country.name}
          </p>
          <p className="text-xs text-muted font-mono">{country.code} · {country.region}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="stat-label">Population</p>
          <p className="text-sm font-mono text-teal">{fmt(country.population)}</p>
        </div>
        <div>
          <p className="stat-label">Density</p>
          <p className="text-sm font-mono text-lav">
            {country.density ? country.density.toFixed(1) + " /km²" : "N/A"}
          </p>
        </div>
      </div>
    </button>
  );
}
