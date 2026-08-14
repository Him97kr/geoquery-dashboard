// Shared helpers for Enzyme tests: a configureStore-backed mock store
// (real reducers, optional preloaded state) plus a wrapper that provides
// Redux + React Router context, since most components in this app read
// from both.
import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import countriesReducer from "./features/countries/countriesSlice";
import filtersReducer from "./features/filters/filtersSlice";
import uiReducer from "./features/ui/uiSlice";

export function makeStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      countries: countriesReducer,
      filters: filtersReducer,
      ui: uiReducer,
    },
    preloadedState,
  });
}

export function AllProviders({ children, store, initialEntries = ["/"] }) {
  const usedStore = store || makeStore();
  return (
    <Provider store={usedStore}>
      <MemoryRouter initialEntries={initialEntries}>
        {children}
      </MemoryRouter>
    </Provider>
  );
}

export const sampleCountry = {
  name: "India",
  code: "IND",
  flag: "https://flagcdn.com/in.svg",
  region: "Asia",
  population: 1417173173,
  density: 481.7,
  area: 3287263,
  languages: ["Hindi", "English"],
  currencies: ["INR"],
  capital: "New Delhi",
};

export const sampleCountries = [
  sampleCountry,
  {
    name: "Brazil",
    code: "BRA",
    flag: "https://flagcdn.com/br.svg",
    region: "Americas",
    population: 216422446,
    density: 25.4,
    area: 8515767,
    languages: ["Portuguese"],
    currencies: ["BRL"],
    capital: "Brasília",
  },
  {
    name: "Germany",
    code: "DEU",
    flag: "https://flagcdn.com/de.svg",
    region: "Europe",
    population: 83240525,
    density: 233.0,
    area: 357114,
    languages: ["German"],
    currencies: ["EUR"],
    capital: "Berlin",
  },
];
