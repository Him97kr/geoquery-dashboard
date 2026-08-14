import React from "react";
import { mount } from "enzyme";
import { act } from "react";
import { Provider } from "react-redux";
import { MockedProvider } from "@apollo/client/testing";
import {
  useGlobalStats, useCountries, useTopByPopulation,
  useTopByCovid, useCountriesWithOutbreaks,
} from "../../hooks/useCountryData";
import {
  GLOBAL_STATS, GET_COUNTRIES, TOP_BY_POPULATION,
  TOP_BY_COVID, COUNTRIES_WITH_OUTBREAKS,
} from "../../apollo/queries";
import { makeStore } from "../../testUtils";
import {
  selectGlobalStats, selectCountries, selectTopPopulation,
  selectTopCovid, selectOutbreakCountries,
} from "../../features/countries/countriesSlice";

async function flush(wrapper) {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });
  wrapper.update();
}

function renderHook(useHookFn, mocks, store) {
  let hookResult;
  function Consumer() {
    hookResult = useHookFn();
    return null;
  }
  const wrapper = mount(
    <Provider store={store}>
      <MockedProvider mocks={mocks}>
        <Consumer />
      </MockedProvider>
    </Provider>
  );
  return { wrapper, getResult: () => hookResult };
}

describe("useGlobalStats", () => {
  it("dispatches setGlobalStats into Redux once the query resolves", async () => {
    const store = makeStore();
    const mocks = [{
      request: { query: GLOBAL_STATS },
      result: { data: { globalStats: { totalCountries: 195 } } },
    }];
    const { wrapper } = renderHook(useGlobalStats, mocks, store);
    await flush(wrapper);
    expect(selectGlobalStats(store.getState())).toEqual({ totalCountries: 195 });
  });

  it("returns loading:true before the query resolves", () => {
    const store = makeStore();
    const mocks = [{
      request: { query: GLOBAL_STATS },
      result: { data: { globalStats: { totalCountries: 195 } } },
    }];
    const { getResult } = renderHook(useGlobalStats, mocks, store);
    expect(getResult().loading).toBe(true);
  });
});

describe("useCountries", () => {
  it("dispatches setCountries and returns the fetched list", async () => {
    const store = makeStore();
    const countries = [{
      __typename: "Country",
      code: "IND", name: "India", flag: "in.svg", region: "Asia",
      population: 1417000000, density: 481, area: 3287263,
      languages: ["Hindi"], currencies: ["INR"], capital: "New Delhi",
    }];
    const mocks = [{
      request: { query: GET_COUNTRIES, variables: { region: null, minPop: null, maxPop: null, limit: 250 } },
      result: { data: { countries } },
    }];
    const { wrapper, getResult } = renderHook(() => useCountries({ limit: 250 }), mocks, store);
    await flush(wrapper);
    expect(selectCountries(store.getState())).toEqual(countries);
    expect(getResult().countries).toEqual(countries);
  });

  it("returns an empty array before data has loaded", () => {
    const store = makeStore();
    const mocks = [{
      request: { query: GET_COUNTRIES, variables: { region: null, minPop: null, maxPop: null, limit: null } },
      result: { data: { countries: [] } },
    }];
    const { getResult } = renderHook(() => useCountries(), mocks, store);
    expect(getResult().countries).toEqual([]);
  });
});

describe("useTopByPopulation", () => {
  it("dispatches setTopPopulation and returns the fetched list", async () => {
    const store = makeStore();
    const top = [{ __typename: "Country", code: "CHN" }, { __typename: "Country", code: "IND" }];
    const mocks = [{
      request: { query: TOP_BY_POPULATION, variables: { limit: 10 } },
      result: { data: { topByPopulation: top } },
    }];
    const { wrapper, getResult } = renderHook(() => useTopByPopulation(10), mocks, store);
    await flush(wrapper);
    expect(selectTopPopulation(store.getState())).toEqual(top);
    expect(getResult().countries).toEqual(top);
  });
});

describe("useTopByCovid", () => {
  it("dispatches setTopCovid and returns the fetched list", async () => {
    const store = makeStore();
    const top = [{ __typename: "Country", code: "USA" }];
    const mocks = [{
      request: { query: TOP_BY_COVID, variables: { limit: 20 } },
      result: { data: { topByCovid: top } },
    }];
    const { wrapper, getResult } = renderHook(() => useTopByCovid(20), mocks, store);
    await flush(wrapper);
    expect(selectTopCovid(store.getState())).toEqual(top);
    expect(getResult().countries).toEqual(top);
  });
});

describe("useCountriesWithOutbreaks", () => {
  it("dispatches setOutbreakCountries and returns the fetched list", async () => {
    const store = makeStore();
    const outbreaks = [{
      __typename: "Country", code: "COD",
      outbreaks: [{ __typename: "Outbreak", title: "Ebola" }],
    }];
    const mocks = [{
      request: { query: COUNTRIES_WITH_OUTBREAKS },
      result: { data: { countriesWithOutbreaks: outbreaks } },
    }];
    const { wrapper, getResult } = renderHook(useCountriesWithOutbreaks, mocks, store);
    await flush(wrapper);
    expect(selectOutbreakCountries(store.getState())).toEqual(outbreaks);
    expect(getResult().countries).toEqual(outbreaks);
  });
});
