// src/features/countries/countriesSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list:            [],        // all fetched countries
  selected:        null,      // currently viewed country detail
  globalStats:     null,      // global aggregated stats
  topPopulation:   [],        // top N by population
  topCovid:        [],        // top N by covid cases
  outbreakCountries: [],      // countries with WHO alerts
};

const countriesSlice = createSlice({
  name: "countries",
  initialState,
  reducers: {
    setCountries(state, action) {
      state.list = action.payload;
    },
    setSelectedCountry(state, action) {
      state.selected = action.payload;
    },
    clearSelectedCountry(state) {
      state.selected = null;
    },
    setGlobalStats(state, action) {
      state.globalStats = action.payload;
    },
    setTopPopulation(state, action) {
      state.topPopulation = action.payload;
    },
    setTopCovid(state, action) {
      state.topCovid = action.payload;
    },
    setOutbreakCountries(state, action) {
      state.outbreakCountries = action.payload;
    },
  },
});

export const {
  setCountries,
  setSelectedCountry,
  clearSelectedCountry,
  setGlobalStats,
  setTopPopulation,
  setTopCovid,
  setOutbreakCountries,
} = countriesSlice.actions;

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectCountries        = (s) => s.countries.list;
export const selectSelectedCountry  = (s) => s.countries.selected;
export const selectGlobalStats      = (s) => s.countries.globalStats;
export const selectTopPopulation    = (s) => s.countries.topPopulation;
export const selectTopCovid         = (s) => s.countries.topCovid;
export const selectOutbreakCountries= (s) => s.countries.outbreakCountries;

export default countriesSlice.reducer;
