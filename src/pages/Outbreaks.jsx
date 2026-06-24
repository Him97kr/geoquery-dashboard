// src/pages/Outbreaks.jsx
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { selectOutbreakCountries } from "../features/countries/countriesSlice";
import { useCountriesWithOutbreaks, useCountries } from "../hooks/useCountryData";
import ChoroplethMap from "../components/charts/ChoroplethMap";
import Loader from "../components/ui/Loader";
import { whoOutbreaksUrl } from "./utils";

function formatDate(str) {
  if (!str) return "";
  try { return new Date(str).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); }
  catch { return str; }
}

export default function Outbreaks() {
  const navigate = useNavigate();
  const { loading } = useCountriesWithOutbreaks();
  const { countries: allCountries } = useCountries({ limit: 250 });
  const outbreak = useSelector(selectOutbreakCountries);

  if (loading && !outbreak.length) return <Loader text="Fetching WHO outbreak data..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading text-2xl flex items-center gap-2">
          <AlertTriangle size={22} className="text-red-400" strokeWidth={1.75} />
          WHO Outbreak Alerts
        </h1>
        <p className="text-muted text-sm mt-1">
          Countries with active WHO Disease Outbreak News — {outbreak.length} countries affected
        </p>
      </div>

      {/* Map */}
      <ChoroplethMap countries={allCountries} />

      {/* Alert cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {outbreak.map((country) => (
          <div key={country.code} className="card border border-red-500/20 hover:border-red-500/40 transition-colors">
            {/* Country header */}
            <button
              onClick={() => navigate(`/country/${country.code}`)}
              className="flex items-center gap-3 mb-3 group w-full text-left"
            >
              <span className="text-2xl">{country.flag}</span>
              <div>
                <p className="font-semibold text-ink group-hover:text-teal transition-colors">
                  {country.name}
                </p>
                <p className="text-xs text-muted font-mono">{country.region} · Pop: {(country.population / 1e6).toFixed(1)}M</p>
              </div>
              <span className="ml-auto text-xs badge border-red-500/40 text-red-400">
                {country.outbreaks?.length} alert{country.outbreaks?.length !== 1 ? "s" : ""}
              </span>
            </button>

            {/* Outbreak list */}
            <div className="space-y-2">
              {country.outbreaks?.map((o, i) => (
                <a
                  key={i}
                  href={whoOutbreaksUrl + o.urlName || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border-l-2 border-red-500/60 pl-3 py-1 hover:border-red-400 transition-colors"
                >
                  <p className="text-xs text-ink leading-relaxed">{o.title}</p>
                  {o.date && (
                    <p className="text-xs text-muted mt-0.5">{formatDate(o.date)}</p>
                  )}
                </a>
              ))}
            </div>
          </div>
        ))}

        {outbreak.length === 0 && (
          <div className="col-span-2 text-center py-16">
            <CheckCircle2 size={36} className="text-teal mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-ink font-semibold">No active WHO outbreak alerts</p>
            <p className="text-muted text-sm mt-1">WHO data is checked every 30 minutes</p>
          </div>
        )}
      </div>
    </div>
  );
}
