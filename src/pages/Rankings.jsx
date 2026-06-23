// src/pages/Rankings.jsx
import { useSelector, useDispatch } from "react-redux";
import { selectTopPopulation, selectTopCovid } from "../features/countries/countriesSlice";
import { selectRankLimit, setRankLimit }        from "../features/filters/filtersSlice";
import { selectChartType, setChartType }        from "../features/ui/uiSlice";
import { useTopByPopulation, useTopByCovid }    from "../hooks/useCountryData";
import BarChart        from "../components/charts/BarChart";
import BubbleChart     from "../components/charts/BubbleChart";
import TreemapChart    from "../components/charts/TreemapChart";
import LineChart       from "../components/charts/LineChart";
import Loader          from "../components/ui/Loader";
import { useMemo }     from "react";

const CHART_TYPES = [
  { key: "bar",     label: "Bar",             icon: "📊" },
  { key: "bubble",  label: "Bubble",          icon: "🫧" },
  { key: "treemap", label: "Treemap",         icon: "🗂️" },
  { key: "line",    label: "Multi-Metric",    icon: "📈" },
];

const LIMITS = [10, 15, 20];

export default function Rankings() {
  const dispatch      = useDispatch();
  const limit         = useSelector(selectRankLimit);
  const chartType     = useSelector(selectChartType);
  const topPopulation = useSelector(selectTopPopulation);
  const topCovid      = useSelector(selectTopCovid);

  const { loading: popLoading } = useTopByPopulation(20); // always fetch 20 for line chart
  const { loading: covLoading } = useTopByCovid(20);

  // Bubble — merge density+population with covid cases
  const bubbleData = useMemo(() => {
    const covidMap = {};
    topCovid.forEach((c) => { covidMap[c.code] = c.covid?.cases || 0; });
    return topPopulation
      .filter((c) => c.density > 0)
      .map((c) => ({
        name:   c.name,
        flag:   c.flag,
        x:      c.density,
        y:      c.population,
        r:      covidMap[c.code] || 0,
        region: c.region,
      }));
  }, [topPopulation, topCovid]);

  // Line chart — merge top 20 population with covid cases + density
  const lineData = useMemo(() => {
    const covidMap = {};
    topCovid.forEach((c) => { covidMap[c.code] = c.covid?.cases || 0; });

    return topPopulation
      .slice(0, 20)
      .map((c) => ({
        name:       c.name,
        flag:       c.flag || "🌍",
        population: c.population || 0,
        density:    c.density    || 0,
        covidCases: covidMap[c.code] || 0,
      }));
  }, [topPopulation, topCovid]);

  const loading = popLoading || covLoading;

  // Displayed top N — sliced from fetched 20
  const displayedPop   = topPopulation.slice(0, limit);
  const displayedCovid = topCovid.slice(0, limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">🏆 Rankings & Charts</h1>
          <p className="text-muted text-sm mt-1">
            Compare countries across population, density and COVID metrics
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Chart type */}
          <div className="flex gap-2 flex-wrap">
            {CHART_TYPES.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => dispatch(setChartType(key))}
                className={`badge transition-colors ${
                  chartType === key
                    ? "border-teal text-teal bg-teal/10"
                    : "border-border text-muted hover:border-teal/40"
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          {/* Top N — only for bar/bubble/stacked */}
          {["bar", "bubble", "stacked"].includes(chartType) && (
            <div className="flex gap-1">
              {LIMITS.map((l) => (
                <button
                  key={l}
                  onClick={() => dispatch(setRankLimit(l))}
                  className={`badge transition-colors ${
                    limit === l
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

            {/* ── Bar ──────────────────────────────────────────────────── */}
            {chartType === "bar" && (
              <>
                <BarChart
                  data={displayedPop}
                  valueKey="population"
                  labelKey="name"
                  color="#00e5a0"
                  title={`Top ${limit} Countries by Population`}
                />
                <BarChart
                  data={displayedCovid.map((c) => ({
                    ...c,
                    covidCases: c.covid?.cases || 0,
                  }))}
                  valueKey="covidCases"
                  labelKey="name"
                  color="#f87171"
                  title={`Top ${limit} Countries by COVID Cases`}
                />
                <BarChart
                  data={[...displayedPop].sort((a, b) => b.density - a.density)}
                  valueKey="density"
                  labelKey="name"
                  color="#b4b4f9"
                  title={`Top ${limit} Countries by Population Density`}
                />
              </>
            )}

            {/* ── Bubble ───────────────────────────────────────────────── */}
            {chartType === "bubble" && (
              <BubbleChart
                data={bubbleData.slice(0, limit)}
                title="Population vs Density (bubble size = COVID cases)"
              />
            )}

            {/* ── Treemap ──────────────────────────────────────────────── */}
            {chartType === "treemap" && (
              <TreemapChart
                data={topPopulation}
                title="World Population Treemap — area proportional to population"
              />
            )}

            {/* ── Line — multi-metric ───────────────────────────────────── */}
            {chartType === "line" && (
              lineData.length > 0
                ? <LineChart
                    data={lineData}
                    title="Top 20 Populated Countries — Population vs Density vs COVID Cases (normalized 0–100)"
                  />
                : <Loader text="Merging metrics..." />
            )}

          </div>
        )
      }
    </div>
  );
}
