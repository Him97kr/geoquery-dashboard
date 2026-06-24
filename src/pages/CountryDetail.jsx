// src/pages/CountryDetail.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { useDispatch } from "react-redux";
import {
  Users, Ruler, MapPin, Landmark,
  Activity, Skull, Zap, HeartPulse, CheckCircle2, CalendarDays, TrendingUp, FlaskConical,
  ArrowLeft, Globe2,
} from "lucide-react";
import { setSelectedCountry } from "../features/countries/countriesSlice";
import { GET_COUNTRY } from "../apollo/queries";
import StatCard from "../components/ui/StatCard";
import Loader from "../components/ui/Loader";
import { useEffect } from "react";
import { whoOutbreaksUrl } from "./utils";

function fmt(n) {
  if (!n && n !== 0) return "N/A";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(0) + "K";
  return n.toLocaleString();
}

function formatDate(str) {
  if (!str) return "";
  try { return new Date(str).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); }
  catch { return str; }
}

export default function CountryDetail() {
  const { code } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { data, loading, error } = useQuery(GET_COUNTRY, {
    variables: { code: code ?? null, name: null },
    skip: !code,
    fetchPolicy: "network-only",
  });

  const country = data?.country;

  useEffect(() => {
    if (country) dispatch(setSelectedCountry(country));
  }, [country, dispatch]);

  if (loading) return <Loader text={`Loading ${code}...`} />;
  if (error || !country) return (
    <div className="text-center py-24">
      <Globe2 size={36} className="text-muted mx-auto mb-3" strokeWidth={1.5} />
      <p className="text-ink font-semibold">Country not found</p>
      <p className="text-muted text-xs mt-2 font-mono">code: {code}</p>
      {error && <p className="text-red-400 text-xs mt-1 font-mono">{error.message}</p>}
      <button onClick={() => navigate("/explorer")} className="btn-ghost mt-4 text-sm">
        Back to Explorer
      </button>
    </div>
  );

  const c = country;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back + header */}
      <div>
        <button onClick={() => navigate(-1)} className="text-muted hover:text-teal text-sm mb-3 flex items-center gap-1 transition-colors">
          <ArrowLeft size={14} strokeWidth={1.75} /> Back
        </button>
        <div className="flex items-center gap-4">
          <span className="text-6xl">{c.flag}</span>
          <div>
            <h1 className="heading text-3xl">{c.name}</h1>
            <p className="text-muted font-mono text-sm mt-1">
              {c.code} · {c.capital || "N/A"} · {c.region}
            </p>
          </div>
        </div>
      </div>

      {/* Demographics */}
      <div>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-widest mb-3">Demographics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Population" value={fmt(c.population)} accent="teal" />
          <StatCard icon={Ruler} label="Density" value={c.density ? c.density.toFixed(1) + " /km²" : "N/A"} accent="lav" />
          <StatCard icon={MapPin} label="Area" value={fmt(c.area) + " km²"} accent="yellow" />
          <StatCard icon={Landmark} label="Capital" value={c.capital || "N/A"} accent="teal" />
        </div>
      </div>

      {/* Languages + currencies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <p className="stat-label mb-2">Languages</p>
          <div className="flex flex-wrap gap-2">
            {c.languages?.map((l) => (
              <span key={l} className="badge border-teal/20 text-teal bg-teal/5">{l}</span>
            ))}
          </div>
        </div>
        <div className="card">
          <p className="stat-label mb-2">Currencies</p>
          <div className="flex flex-wrap gap-2">
            {c.currencies?.map((cur) => (
              <span key={cur} className="badge border-lav/20 text-lav bg-lav/5">{cur}</span>
            ))}
          </div>
        </div>
      </div>

      {/* COVID stats */}
      {c.covid && (
        <div>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-widest mb-3">
            COVID-19 · disease.sh
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Activity} label="Total Cases" value={fmt(c.covid.cases)} accent="red" />
            <StatCard icon={Skull} label="Deaths" value={fmt(c.covid.deaths)} accent="red" />
            <StatCard icon={Zap} label="Active" value={fmt(c.covid.active)} accent="yellow" />
            <StatCard icon={HeartPulse} label="Critical" value={fmt(c.covid.critical)} accent="yellow" />
            <StatCard icon={CheckCircle2} label="Recovered" value={fmt(c.covid.recovered)} accent="teal" />
            <StatCard icon={CalendarDays} label="Today Cases" value={fmt(c.covid.todayCases)} accent="lav" />
            <StatCard icon={TrendingUp} label="Per Million" value={c.covid.casesPerMillion?.toFixed(0)} accent="lav" />
            <StatCard icon={FlaskConical} label="Tests" value={fmt(c.covid.tests)} accent="teal" />
          </div>
          {c.covid.updatedAt && (
            <p className="text-xs text-muted mt-2 font-mono">
              Last updated: {formatDate(c.covid.updatedAt)}
            </p>
          )}
        </div>
      )}

      {/* WHO outbreaks */}
      <div>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-widest mb-3">
          WHO Outbreak Alerts
        </h2>
        {c.outbreaks?.length > 0 ? (
          <div className="space-y-3">
            {c.outbreaks.map((o, i) => (
              <a
                key={i}
                href={whoOutbreaksUrl + o.urlName || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="card border border-red-500/20 hover:border-red-500/40 transition-colors block"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-ink">{o.title}</p>
                    {o.summary && <p className="text-xs text-muted mt-1 leading-relaxed">{o.summary}</p>}
                  </div>
                  <span className="text-xs text-muted whitespace-nowrap">{formatDate(o.date)}</span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="card border-border text-center py-6">
            <CheckCircle2 size={24} className="text-teal mx-auto mb-1" strokeWidth={1.5} />
            <p className="text-muted text-sm">No active WHO alerts for {c.name}</p>
          </div>
        )}
      </div>
    </div>
  );
}
