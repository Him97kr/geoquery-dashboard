// src/features/ui/uiSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  activePage:   "home",
  chartType:    "bar",
  mapMetric:    "population",
  toast:        null,
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
  },
});

export const {
  setActivePage, setChartType,
  setMapMetric, showToast, clearToast,
} = uiSlice.actions;

export const selectActivePage  = (s) => s.ui.activePage;
export const selectChartType   = (s) => s.ui.chartType;
export const selectMapMetric   = (s) => s.ui.mapMetric;
export const selectToast       = (s) => s.ui.toast;

export default uiSlice.reducer;
