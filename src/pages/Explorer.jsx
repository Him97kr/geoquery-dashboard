// src/pages/Explorer.jsx
import { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useQuery } from "@apollo/client";
import { SEARCH_COUNTRIES, GET_COUNTRIES } from "../apollo/queries";
import {
  selectSearch, selectRegion,
  setSortBy, setSortDir,
  selectSortBy, selectSortDir,
  setSearch, setRegion, resetFilters,
} from "../features/filters/filtersSlice";
import CountryCard from "../components/ui/CountryCard";
import Loader      from "../components/ui/Loader";

const REGIONS = ["Africa", "Americas", "Asia", "Europe", "Oceania"];

export default function Explorer() {
  const dispatch = useDispatch();
  const search   = useSelector(selectSearch);
  const region   = useSelector(selectRegion);
  const sortBy   = useSelector(selectSortBy);
  const sortDir  = useSelector(selectSortDir);

  const { data: searchData, loading: searchLoading } = useQuery(SEARCH_COUNTRIES, {
    variables: { query: search },
    skip: search.length < 2,
  });

  const { data: allData, loading: allLoading } = useQuery(GET_COUNTRIES, {
    variables: { region: region || null, limit: 250 },
    skip: search.length >= 2,
  });

  const loading  = search.length >= 2 ? searchLoading : allLoading;
  const rawData  = search.length >= 2 ? searchData?.searchCountries : allData?.countries;

  const countries = useMemo(() => {
    if (!rawData) return [];
    return [...rawData].sort((a, b) => {
      let aVal = sortBy === "name" ? a.name : (a[sortBy] ?? 0);
      let bVal = sortBy === "name" ? b.name : (b[sortBy] ?? 0);
      if (sortDir === "asc") return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });
  }, [rawData, sortBy, sortDir]);

  const sortCols = [
    { key: "name",       label: "Name" },
    { key: "population", label: "Population" },
    { key: "density",    label: "Density" },
    { key: "area",       label: "Area" },
  ];

  function toggleSort(key) {
    if (sortBy === key) dispatch(setSortDir(sortDir === "desc" ? "asc" : "desc"));
    else { dispatch(setSortBy(key)); dispatch(setSortDir("desc")); }
  }

  return (
    <div className="space-y-6">
      {/* Header + controls */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">🔍 Country Explorer</h1>
          <p className="text-muted text-sm mt-1">
            {countries.length} countries {region ? `in ${region}` : "worldwide"}
          </p>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => dispatch(setSearch(e.target.value))}
            placeholder="Search country..."
            className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-ink placeholder-muted focus:outline-none focus:border-teal transition-colors w-44"
          />

          {/* Region filter */}
          <select
            value={region}
            onChange={(e) => dispatch(setRegion(e.target.value))}
            className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-ink focus:outline-none focus:border-teal transition-colors"
          >
            <option value="">All Regions</option>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>

          {/* Reset */}
          <button onClick={() => dispatch(resetFilters())} className="btn-ghost text-sm">
            Reset
          </button>

          {/* Sort */}
          <div className="flex gap-1">
            {sortCols.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => toggleSort(key)}
                className={`badge transition-colors ${
                  sortBy === key
                    ? "border-teal text-teal bg-teal/10"
                    : "border-border text-muted hover:border-teal/40"
                }`}
              >
                {label}{sortBy === key && (sortDir === "desc" ? " ↓" : " ↑")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading
        ? <Loader text="Fetching countries..." />
        : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {countries.map((c) => <CountryCard key={c.code} country={c} />)}
            {countries.length === 0 && (
              <p className="text-muted col-span-4 text-center py-16">No countries found.</p>
            )}
          </div>
        )
      }
    </div>
  );
}
