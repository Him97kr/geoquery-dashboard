import reducer, {
  setCountries,
  setSelectedCountry,
  clearSelectedCountry,
  setGlobalStats,
  setTopPopulation,
  setTopCovid,
  setOutbreakCountries,
  selectCountries,
  selectSelectedCountry,
  selectGlobalStats,
  selectTopPopulation,
  selectTopCovid,
  selectOutbreakCountries,
} from "../../../features/countries/countriesSlice";

const initialState = {
  list: [],
  selected: null,
  globalStats: null,
  topPopulation: [],
  topCovid: [],
  outbreakCountries: [],
};

describe("countriesSlice reducer", () => {
  it("returns the initial state", () => {
    expect(reducer(undefined, { type: "@@INIT" })).toEqual(initialState);
  });

  it("handles setCountries", () => {
    const countries = [{ code: "IND", name: "India" }];
    const state = reducer(initialState, setCountries(countries));
    expect(state.list).toEqual(countries);
  });

  it("handles setSelectedCountry", () => {
    const country = { code: "USA", name: "United States" };
    const state = reducer(initialState, setSelectedCountry(country));
    expect(state.selected).toEqual(country);
  });

  it("handles clearSelectedCountry", () => {
    const populated = { ...initialState, selected: { code: "USA" } };
    const state = reducer(populated, clearSelectedCountry());
    expect(state.selected).toBeNull();
  });

  it("handles setGlobalStats", () => {
    const stats = { totalCountries: 195 };
    const state = reducer(initialState, setGlobalStats(stats));
    expect(state.globalStats).toEqual(stats);
  });

  it("handles setTopPopulation", () => {
    const top = [{ code: "CHN" }, { code: "IND" }];
    const state = reducer(initialState, setTopPopulation(top));
    expect(state.topPopulation).toEqual(top);
  });

  it("handles setTopCovid", () => {
    const top = [{ code: "USA" }];
    const state = reducer(initialState, setTopCovid(top));
    expect(state.topCovid).toEqual(top);
  });

  it("handles setOutbreakCountries", () => {
    const outbreaks = [{ code: "COD" }];
    const state = reducer(initialState, setOutbreakCountries(outbreaks));
    expect(state.outbreakCountries).toEqual(outbreaks);
  });

  it("does not mutate the previous state", () => {
    const frozen = Object.freeze({ ...initialState });
    expect(() => reducer(frozen, setCountries([{ code: "IND" }]))).not.toThrow();
  });
});

describe("countriesSlice selectors", () => {
  const state = {
    countries: {
      list: [{ code: "IND" }],
      selected: { code: "USA" },
      globalStats: { totalCountries: 195 },
      topPopulation: [{ code: "CHN" }],
      topCovid: [{ code: "USA" }],
      outbreakCountries: [{ code: "COD" }],
    },
  };

  it("selectCountries returns list", () => {
    expect(selectCountries(state)).toEqual([{ code: "IND" }]);
  });

  it("selectSelectedCountry returns selected", () => {
    expect(selectSelectedCountry(state)).toEqual({ code: "USA" });
  });

  it("selectGlobalStats returns globalStats", () => {
    expect(selectGlobalStats(state)).toEqual({ totalCountries: 195 });
  });

  it("selectTopPopulation returns topPopulation", () => {
    expect(selectTopPopulation(state)).toEqual([{ code: "CHN" }]);
  });

  it("selectTopCovid returns topCovid", () => {
    expect(selectTopCovid(state)).toEqual([{ code: "USA" }]);
  });

  it("selectOutbreakCountries returns outbreakCountries", () => {
    expect(selectOutbreakCountries(state)).toEqual([{ code: "COD" }]);
  });
});
