import reducer, {
  setSearch,
  setRegion,
  setMinPop,
  setMaxPop,
  setSortBy,
  setSortDir,
  setRankLimit,
  resetFilters,
  selectSearch,
  selectRegion,
  selectMinPop,
  selectMaxPop,
  selectSortBy,
  selectSortDir,
  selectRankLimit,
  selectAllFilters,
} from "../../../features/filters/filtersSlice";

const initialState = {
  search: "",
  region: "",
  minPop: null,
  maxPop: null,
  sortBy: "population",
  sortDir: "desc",
  rankLimit: 20,
};

describe("filtersSlice reducer", () => {
  it("returns the initial state", () => {
    expect(reducer(undefined, { type: "@@INIT" })).toEqual(initialState);
  });

  it("handles setSearch", () => {
    const state = reducer(initialState, setSearch("india"));
    expect(state.search).toBe("india");
  });

  it("handles setRegion", () => {
    const state = reducer(initialState, setRegion("Asia"));
    expect(state.region).toBe("Asia");
  });

  it("handles setMinPop", () => {
    const state = reducer(initialState, setMinPop(1000));
    expect(state.minPop).toBe(1000);
  });

  it("handles setMaxPop", () => {
    const state = reducer(initialState, setMaxPop(9999999));
    expect(state.maxPop).toBe(9999999);
  });

  it("handles setSortBy", () => {
    const state = reducer(initialState, setSortBy("density"));
    expect(state.sortBy).toBe("density");
  });

  it("handles setSortDir", () => {
    const state = reducer(initialState, setSortDir("asc"));
    expect(state.sortDir).toBe("asc");
  });

  it("handles setRankLimit", () => {
    const state = reducer(initialState, setRankLimit(10));
    expect(state.rankLimit).toBe(10);
  });

  it("handles resetFilters, restoring defaults even after several mutations", () => {
    let state = reducer(initialState, setSearch("brazil"));
    state = reducer(state, setRegion("Americas"));
    state = reducer(state, setSortBy("name"));
    state = reducer(state, resetFilters());
    expect(state).toEqual(initialState);
  });
});

describe("filtersSlice selectors", () => {
  const state = {
    filters: {
      search: "brazil",
      region: "Americas",
      minPop: 100,
      maxPop: 200,
      sortBy: "name",
      sortDir: "asc",
      rankLimit: 15,
    },
  };

  it("selectSearch", () => expect(selectSearch(state)).toBe("brazil"));
  it("selectRegion", () => expect(selectRegion(state)).toBe("Americas"));
  it("selectMinPop", () => expect(selectMinPop(state)).toBe(100));
  it("selectMaxPop", () => expect(selectMaxPop(state)).toBe(200));
  it("selectSortBy", () => expect(selectSortBy(state)).toBe("name"));
  it("selectSortDir", () => expect(selectSortDir(state)).toBe("asc"));
  it("selectRankLimit", () => expect(selectRankLimit(state)).toBe(15));
  it("selectAllFilters returns the whole slice", () => {
    expect(selectAllFilters(state)).toEqual(state.filters);
  });
});
