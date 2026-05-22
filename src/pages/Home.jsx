// src/pages/Home.jsx
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectGlobalStats } from "../features/countries/countriesSlice";
import { useGlobalStats, useCountries } from "../hooks/useCountryData";
import StatCard from "../components/ui/StatCard";
import Loader   from "../components/ui/Loader";
import ChoroplethMap from "../components/charts/ChoroplethMap";

function fmt(n) {
  if (!n && n !== 0) return "N/A";
  const num = Number(n);
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(0) + "K";
  return num.toLocaleString();
}

export default function Home() {
  const navigate     = useNavigate();
  const globalStats  = useSelector(selectGlobalStats);
  const { loading }  = useGlobalStats();
  const { countries }= useCountries({ limit: 250 });

  if (loading && !globalStats) return <Loader text="Loading global stats..." />;

  const s = globalStats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          🌍 Global Overview
        </h1>
        <p className="text-muted text-sm mt-1">
          Live data from REST Countries · disease.sh · WHO — via GeoQuery GraphQL API
        </p>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="🌐" label="Countries"      value={fmt(s?.totalCountries)}   accent="teal" />
        <StatCard icon="👥" label="World Population" value={fmt(s?.totalPopulation ? parseInt(s.totalPopulation) : null)} accent="lav" />
        <StatCard icon="🦠" label="Total COVID Cases" value={fmt(s?.totalCovidCases)} accent="red" />
        <StatCard icon="💀" label="COVID Deaths"    value={fmt(s?.totalCovidDeaths)} accent="yellow" />
      </div>

      {/* Notable countries */}
      {s && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Most Populated",   country: s.mostPopulated,  val: fmt(s.mostPopulated?.population) + " people",   accent: "teal" },
            { label: "Least Populated",  country: s.leastPopulated, val: fmt(s.leastPopulated?.population) + " people",  accent: "lav" },
            { label: "Highest Density",  country: s.highestDensity, val: s.highestDensity?.density?.toFixed(1) + " /km²", accent: "yellow" },
            { label: "Most COVID Cases", country: s.mostCovidCases, val: fmt(s.mostCovidCases?.covid?.cases) + " cases",  accent: "red" },
          ].map(({ label, country, val, accent }) => (
            <button
              key={label}
              onClick={() => country && navigate(`/country/${country.code}`)}
              className={`card border border-border hover:border-teal/40 transition-all text-left group`}
            >
              <p className="stat-label mb-2">{label}</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{country?.flag}</span>
                <div>
                  <p className="font-semibold text-white text-sm group-hover:text-teal transition-colors">
                    {country?.name || "N/A"}
                  </p>
                  <p className={`text-xs font-mono ${
                    accent === "teal"   ? "text-teal"   :
                    accent === "lav"    ? "text-lav"    :
                    accent === "red"    ? "text-red-400" : "text-yellow-400"
                  }`}>{val}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* World map */}
      <ChoroplethMap countries={countries} />

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { path: "/explorer",  icon: "🔍", title: "Country Explorer", desc: "Search and filter all countries" },
          { path: "/rankings",  icon: "🏆", title: "Rankings & Charts", desc: "Top countries by population, density and COVID" },
          { path: "/outbreaks", icon: "🚨", title: "Outbreak Alerts",   desc: "Countries with active WHO disease alerts" },
        ].map(({ path, icon, title, desc }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="card border border-border hover:border-teal/40 transition-all text-left group"
          >
            <span className="text-2xl mb-2 block">{icon}</span>
            <p className="font-semibold text-white group-hover:text-teal transition-colors">{title}</p>
            <p className="text-xs text-muted mt-1">{desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
