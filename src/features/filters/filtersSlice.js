// src/features/filters/filtersSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  search:    "",
  region:    "",           // e.g. "Asia", "Europe"
  minPop:    null,
  maxPop:    null,
  sortBy:    "population", // "population" | "density" | "name" | "cases"
  sortDir:   "desc",       // "asc" | "desc"
  rankLimit: 20,           // for Rankings page
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setSearch(state, action)    { state.search    = action.payload; },
    setRegion(state, action)    { state.region    = action.payload; },    setMinPop(state, action)    { state.minPop    = action.payload; },
    setMaxPop(state, action)    { state.maxPop    = action.payload; },
    setSortBy(state, action)    { state.sortBy    = action.payload; },
    setSortDir(state, action)   { state.sortDir   = action.payload; },
    setRankLimit(state, action) { state.rankLimit = action.payload; },
    resetFilters(state)         { return initialState; },
  },
});

export const {
  setSearch, setRegion,  setMinPop, setMaxPop, setSortBy,
  setSortDir, setRankLimit, resetFilters,
} = filtersSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectSearch    = (s) => s.filters.search;
export const selectRegion    = (s) => s.filters.region;
export const selectMinPop    = (s) => s.filters.minPop;
export const selectMaxPop    = (s) => s.filters.maxPop;
export const selectSortBy    = (s) => s.filters.sortBy;
export const selectSortDir   = (s) => s.filters.sortDir;
export const selectRankLimit = (s) => s.filters.rankLimit;
export const selectAllFilters= (s) => s.filters;

export default filtersSlice.reducer;
