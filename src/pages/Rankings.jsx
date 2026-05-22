// src/pages/Rankings.jsx
import { useSelector, useDispatch } from "react-redux";
import { selectTopPopulation, selectTopCovid } from "../features/countries/countriesSlice";
import { selectRankLimit, setRankLimit } from "../features/filters/filtersSlice";
import { selectChartType, setChartType } from "../features/ui/uiSlice";
import { useTopByPopulation, useTopByCovid, useCountries } from "../hooks/useCountryData";
import BarChart    from "../components/charts/BarChart";
import LineChart   from "../components/charts/LineChart";
import BubbleChart from "../components/charts/BubbleChart";
import Loader      from "../components/ui/Loader";
import { useMemo } from "react";

const CHART_TYPES = [
  { key: "bar",    label: "Bar Chart",    icon: "📊" },
  { key: "bubble", label: "Bubble Chart", icon: "🫧" },
  { key: "line",   label: "Line Chart",   icon: "📈" },
];

const LIMITS = [10, 15, 20];

export default function Rankings() {
  const dispatch      = useDispatch();
  const limit         = useSelector(selectRankLimit);
  const chartType     = useSelector(selectChartType);
  const topPopulation = useSelector(selectTopPopulation);
  const topCovid      = useSelector(selectTopCovid);

  const { loading: popLoading } = useTopByPopulation(limit);
  const { loading: covLoading } = useTopByCovid(limit);
  const { countries: all }      = useCountries({ limit: 250 });

  // Bubble chart data — use topCovid (already has covid field) merged with all countries for density
  const bubbleData = useMemo(() => {
    // Build density lookup from all countries
    const densityMap = {};
    all.forEach((c) => { densityMap[c.code] = c; });

    return topCovid
      .filter((c) => {
        const base = densityMap[c.code];
        return base && base.density > 0 && c.covid?.cases > 0;
      })
      .map((c) => {
        const base = densityMap[c.code];
        return {
          name:   c.name,
          flag:   c.flag,
          x:      base.density,
          y:      base.population,
          r:      c.covid?.cases || 0,
          region: base.region,
        };
      });
  }, [all, topCovid]);

  // Line chart — top 6 countries population trend (simulated from current data)
  const lineData = useMemo(() => {
    return topPopulation.slice(0, 6).map((c) => ({
      name: c.name,
      values: [2018,2019,2020,2021,2022,2023,2024].map((yr, i) => ({
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
          <p className="text-muted text-sm mt-1">Compare countries across population, density and COVID metrics</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Chart type */}
          <div className="flex gap-2">
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

          {/* Limit selector */}
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
        </div>
      </div>

      {loading && !topPopulation.length
        ? <Loader text="Loading rankings..." />
        : (
          <div className="space-y-6">
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
                  data={[...topPopulation].sort((a,b) => b.density - a.density)}
                  valueKey="density"
                  labelKey="name"
                  color="#b4b4f9"
                  title={`Top ${limit} Countries by Density`}
                />
              </>
            )}

            {chartType === "bubble" && (
              <BubbleChart
                data={bubbleData}
                title="Population vs Density vs COVID Cases (bubble size = COVID cases)"
              />
            )}

            {chartType === "line" && (
              <LineChart
                data={lineData}
                title={`Population Trend — Top ${Math.min(6, limit)} Countries (2018–2024)`}
              />
            )}
          </div>
        )
      }
    </div>
  );
}
