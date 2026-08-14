describe("uiSlice reducer", () => {
  let reducer, setActivePage, setChartType, setMapMetric, showToast, clearToast,
    setTheme, toggleTheme, selectActivePage, selectChartType, selectMapMetric,
    selectToast, selectTheme;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
    jest.resetModules();
    const mod = require("../../../features/ui/uiSlice");
    ({
      default: reducer, setActivePage, setChartType, setMapMetric, showToast,
      clearToast, setTheme, toggleTheme, selectActivePage, selectChartType,
      selectMapMetric, selectToast, selectTheme,
    } = mod);
  });

  it("initializes theme from localStorage when a valid value is saved", () => {
    localStorage.setItem("geoquery_theme", "light");
    jest.resetModules();
    const mod = require("../../../features/ui/uiSlice");
    const state = mod.default(undefined, { type: "@@INIT" });
    expect(state.theme).toBe("light");
  });

  it("falls back to system preference when nothing is saved", () => {
    window.matchMedia = jest.fn().mockImplementation((query) => ({ matches: true, media: query }));
    jest.resetModules();
    const mod = require("../../../features/ui/uiSlice");
    const state = mod.default(undefined, { type: "@@INIT" });
    expect(state.theme).toBe("dark");
  });

  it("has the expected initial non-theme state", () => {
    const state = reducer(undefined, { type: "@@INIT" });
    expect(state.activePage).toBe("home");
    expect(state.chartType).toBe("bar");
    expect(state.mapMetric).toBe("population");
    expect(state.toast).toBeNull();
  });

  it("handles setActivePage", () => {
    const state = reducer(undefined, setActivePage("explorer"));
    expect(state.activePage).toBe("explorer");
  });

  it("handles setChartType", () => {
    const state = reducer(undefined, setChartType("bubble"));
    expect(state.chartType).toBe("bubble");
  });

  it("handles setMapMetric", () => {
    const state = reducer(undefined, setMapMetric("density"));
    expect(state.mapMetric).toBe("density");
  });

  it("handles showToast and clearToast", () => {
    let state = reducer(undefined, showToast({ message: "Saved" }));
    expect(state.toast).toEqual({ message: "Saved" });
    state = reducer(state, clearToast());
    expect(state.toast).toBeNull();
  });

  it("handles setTheme, applying the dark class and persisting to localStorage", () => {
    const state = reducer(undefined, setTheme("dark"));
    expect(state.theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("geoquery_theme")).toBe("dark");
  });

  it("handles setTheme('light'), removing the dark class", () => {
    document.documentElement.classList.add("dark");
    const state = reducer(undefined, setTheme("light"));
    expect(state.theme).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("handles toggleTheme, flipping dark -> light", () => {
    const darkState = reducer(undefined, setTheme("dark"));
    const state = reducer(darkState, toggleTheme());
    expect(state.theme).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("handles toggleTheme, flipping light -> dark", () => {
    const lightState = reducer(undefined, setTheme("light"));
    const state = reducer(lightState, toggleTheme());
    expect(state.theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("selectors read from the ui slice", () => {
    const state = {
      ui: { activePage: "rankings", chartType: "line", mapMetric: "cases", toast: "hi", theme: "dark" },
    };
    expect(selectActivePage(state)).toBe("rankings");
    expect(selectChartType(state)).toBe("line");
    expect(selectMapMetric(state)).toBe("cases");
    expect(selectToast(state)).toBe("hi");
    expect(selectTheme(state)).toBe("dark");
  });
});
