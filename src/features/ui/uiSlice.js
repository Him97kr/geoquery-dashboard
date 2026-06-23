// src/features/ui/uiSlice.js
import { createSlice } from "@reduxjs/toolkit";

const THEME_KEY = "geoquery_theme";

function loadInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch { /* localStorage unavailable */ }
  // Fall back to system preference
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "dark";
}

function applyThemeClass(theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

const initialTheme = loadInitialTheme();
applyThemeClass(initialTheme); // apply immediately on module load to avoid a flash of wrong theme

const initialState = {
  activePage:   "home",
  chartType:    "bar",
  mapMetric:    "population",
  toast:        null,
  theme:        initialTheme, // "dark" | "light"
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setActivePage(state, action)  { state.activePage  = action.payload; },
    setChartType(state, action)   { state.chartType   = action.payload; },
    setMapMetric(state, action)   { state.mapMetric   = action.payload; },
    showToast(state, action)      { state.toast       = action.payload; },
    clearToast(state)             { state.toast       = null; },
    setTheme(state, action) {
      state.theme = action.payload;
      applyThemeClass(action.payload);
      try { localStorage.setItem(THEME_KEY, action.payload); } catch { /* ignore */ }
    },
    toggleTheme(state) {
      const next = state.theme === "dark" ? "light" : "dark";
      state.theme = next;
      applyThemeClass(next);
      try { localStorage.setItem(THEME_KEY, next); } catch { /* ignore */ }
    },
  },
});

export const {
  setActivePage, setChartType,
  setMapMetric, showToast, clearToast,
  setTheme, toggleTheme,
} = uiSlice.actions;

export const selectActivePage  = (s) => s.ui.activePage;
export const selectChartType   = (s) => s.ui.chartType;
export const selectMapMetric   = (s) => s.ui.mapMetric;
export const selectToast       = (s) => s.ui.toast;
export const selectTheme       = (s) => s.ui.theme;

export default uiSlice.reducer;
