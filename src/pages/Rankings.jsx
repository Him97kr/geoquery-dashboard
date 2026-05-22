// src/pages/Rankings.jsx
import { useSelector, useDispatch } from "react-redux";
import { selectTopPopulation, selectTopCovid } from "../features/countries/countriesSlice";
import { selectRankLimit, setRankLimit } from "../features/filters/filtersSlice";
import { selectChartType, setChartType } from "../features/ui/uiSlice";
import { useTopByPopulation, useTopByCovid } from "../hooks/useCountryData";
import BarChart from "../components/charts/BarChart";
import BubbleChart from "../components/charts/BubbleChart";
import LineChart from "../components/charts/LineChart";
import TreemapChart from "../components/charts/TreemapChart";
import Loader from "../components/ui/Loader";
import { useMemo } from "react";

const CHART_TYPES = [
  { key: "bar", label: "Bar", icon: "📊" },
  { key: "bubble", label: "Bubble", icon: "🫧" },
  { key: "line", label: "Line Chart", icon: "📈" },
  { key: "treemap", label: "Treemap", icon: "🗂️" },
];

const LIMITS = [10, 15, 20];

export default function Rankings() {
  const dispatch = useDispatch();
  const limit = useSelector(selectRankLimit);
  const chartType = useSelector(selectChartType);
  const topPopulation = useSelector(selectTopPopulation);
  const topCovid = useSelector(selectTopCovid);

  const { loading: popLoading } = useTopByPopulation(limit);
  const { loading: covLoading } = useTopByCovid(limit);

  // Bubble chart — merge population+density with covid cases
  const bubbleData = useMemo(() => {
    const covidMap = {};
    topCovid.forEach((c) => { covidMap[c.code] = c.covid?.cases || 0; });
    return topPopulation
      .filter((c) => c.density > 0)
      .map((c) => ({
        name: c.name,
        flag: c.flag,
        x: c.density,
        y: c.population,
        r: covidMap[c.code] || 0,
        region: c.region,
      }));
  }, [topPopulation, topCovid]);

  // Line chart — top 6 countries population trend (simulated from current data)
  const lineData = useMemo(() => {
    return topPopulation.slice(0, 6).map((c) => ({
      name: c.name,
      values: [2018, 2019, 2020, 2021, 2022, 2023, 2024].map((yr, i) => ({
        label: String(yr),
        // simulate slight growth trend from current population
        value: Math.round(c.population * (0.97 + i * 0.005)),
      })),
    }));
  }, [topPopulation]);

  const loading = popLoading || covLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">🏆 Rankings & Charts</h1>
          <p className="text-muted text-sm mt-1">
            Compare countries across population, density and COVID metrics
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Chart type selector */}
          <div className="flex gap-2 flex-wrap">
            {CHART_TYPES.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => dispatch(setChartType(key))}
                className={`badge transition-colors ${chartType === key
                  ? "border-teal text-teal bg-teal/10"
                  : "border-border text-muted hover:border-teal/40"
                  }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          {/* Top N selector — hidden for treemap/stacked where limit doesn't apply */}
          {(chartType === "bar" || chartType === "bubble") && (
            <div className="flex gap-1">
              {LIMITS.map((l) => (
                <button
                  key={l}
                  onClick={() => dispatch(setRankLimit(l))}
                  className={`badge transition-colors ${limit === l
                    ? "border-lav text-lav bg-lav/10"
                    : "border-border text-muted"
                    }`}
                >
                  Top {l}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading && !topPopulation.length
        ? <Loader text="Loading rankings..." />
        : (
          <div className="space-y-6">

            {/* ── Bar charts ────────────────────────────────────────────── */}
            {chartType === "bar" && (
              <>
                <BarChart
                  data={topPopulation}
                  valueKey="population"
                  labelKey="name"
                  color="#00e5a0"
                  title={`Top ${limit} Countries by Population`}
                />
                <BarChart
                  data={topCovid.map((c) => ({ ...c, covidCases: c.covid?.cases || 0 }))}
                  valueKey="covidCases"
                  labelKey="name"
                  color="#f87171"
                  title={`Top ${limit} Countries by COVID Cases`}
                />
                <BarChart
                  data={[...topPopulation].sort((a, b) => b.density - a.density)}
                  valueKey="density"
                  labelKey="name"
                  color="#b4b4f9"
                  title={`Top ${limit} Countries by Population Density`}
                />
              </>
            )}

            {/* ── Bubble chart ──────────────────────────────────────────── */}
            {chartType === "bubble" && (
              <BubbleChart
                data={bubbleData}
                title="Population vs Density (bubble size = COVID cases)"
              />
            )}

            {chartType === "line" && (
              <LineChart
                data={lineData}
                title={`Population Trend — Top ${Math.min(6, limit)} Countries (2018–2024)`}
              />
            )}

            {/* ── Treemap ───────────────────────────────────────────────── */}
            {chartType === "treemap" && (
              <TreemapChart
                data={topPopulation}
                title="World Population Treemap — size proportional to population"
              />
            )}
          </div>
        )
      }
    </div>
  );
}
