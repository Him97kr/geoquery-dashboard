// src/hooks/useCountryData.js
// Custom hook — fetches data via Apollo and syncs into Redux store
import { useEffect } from "react";
import { useQuery }  from "@apollo/client";
import { useDispatch } from "react-redux";
import {
  setCountries, setGlobalStats,
  setTopPopulation, setTopCovid,
  setOutbreakCountries,
} from "../features/countries/countriesSlice";
import {
  GET_COUNTRIES, GLOBAL_STATS,
  TOP_BY_POPULATION, TOP_BY_COVID,
  COUNTRIES_WITH_OUTBREAKS,
} from "../apollo/queries";

// ── Global stats ──────────────────────────────────────────────────────────────
export function useGlobalStats() {
  const dispatch = useDispatch();
  const { data, loading, error } = useQuery(GLOBAL_STATS);

  useEffect(() => {
    if (data?.globalStats) dispatch(setGlobalStats(data.globalStats));
  }, [data, dispatch]);

  return { loading, error };
}

// ── All countries with optional filters ───────────────────────────────────────
export function useCountries(filters = {}) {
  const dispatch = useDispatch();
  const { data, loading, error } = useQuery(GET_COUNTRIES, {
    variables: {
      region:    filters.region    || null,
      minPop:    filters.minPop    || null,
      maxPop:    filters.maxPop    || null,
      limit:     filters.limit     || null,
    },
  });

  useEffect(() => {
    if (data?.countries) dispatch(setCountries(data.countries));
  }, [data, dispatch]);

  return { loading, error, countries: data?.countries || [] };
}

// ── Top by population ─────────────────────────────────────────────────────────
export function useTopByPopulation(limit = 20) {
  const dispatch = useDispatch();
  const { data, loading, error } = useQuery(TOP_BY_POPULATION, {
    variables: { limit },
  });

  useEffect(() => {
    if (data?.topByPopulation) dispatch(setTopPopulation(data.topByPopulation));
  }, [data, dispatch]);

  return { loading, error, countries: data?.topByPopulation || [] };
}

// ── Top by COVID ──────────────────────────────────────────────────────────────
export function useTopByCovid(limit = 20) {
  const dispatch = useDispatch();
  const { data, loading, error } = useQuery(TOP_BY_COVID, {
    variables: { limit },
  });

  useEffect(() => {
    if (data?.topByCovid) dispatch(setTopCovid(data.topByCovid));
  }, [data, dispatch]);

  return { loading, error, countries: data?.topByCovid || [] };
}

// ── Countries with outbreaks ──────────────────────────────────────────────────
export function useCountriesWithOutbreaks() {
  const dispatch = useDispatch();
  const { data, loading, error } = useQuery(COUNTRIES_WITH_OUTBREAKS);

  useEffect(() => {
    if (data?.countriesWithOutbreaks) {
      dispatch(setOutbreakCountries(data.countriesWithOutbreaks));
    }
  }, [data, dispatch]);

  return { loading, error, countries: data?.countriesWithOutbreaks || [] };
}
