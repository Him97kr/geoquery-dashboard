// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import countriesReducer from "../features/countries/countriesSlice";
import filtersReducer   from "../features/filters/filtersSlice";
import uiReducer        from "../features/ui/uiSlice";

export const store = configureStore({
  reducer: {
    countries: countriesReducer,
    filters:   filtersReducer,
    ui:        uiReducer,
  },
});
