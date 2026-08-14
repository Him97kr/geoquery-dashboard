import { readThemeColors, getOrCreateTooltip } from "../../../components/charts/chartTheme";

describe("readThemeColors", () => {
  afterEach(() => {
    document.documentElement.classList.remove("dark");
  });

  it("returns light-mode colors when the 'dark' class is absent", () => {
    const t = readThemeColors();
    expect(t.isDark).toBe(false);
    expect(t.teal).toBe("#009670");
    expect(t.lav).toBe("#635bdb");
    expect(t.ink).toBe("#0f172a");
  });

  it("returns dark-mode colors when the 'dark' class is present", () => {
    document.documentElement.classList.add("dark");
    const t = readThemeColors();
    expect(t.isDark).toBe(true);
    expect(t.teal).toBe("#00e5a0");
    expect(t.lav).toBe("#b4b4f9");
    expect(t.ink).toBe("#ffffff");
  });

  it("provides a color for every declared world region", () => {
    const t = readThemeColors();
    ["Asia", "Europe", "Americas", "Africa", "Oceania", "Antarctic"].forEach((region) => {
      expect(t.region[region]).toBeTruthy();
    });
  });

  it("provides tooltip and map surface colors appropriate to the mode", () => {
    const light = readThemeColors();
    expect(light.tooltipBg).toBe("#ffffff");
    expect(light.mapOcean).toBe("#eef2f7");

    document.documentElement.classList.add("dark");
    const dark = readThemeColors();
    expect(dark.tooltipBg).toBe("#0d1117");
    expect(dark.mapOcean).toBe("#0a0f18");
  });
});

describe("getOrCreateTooltip", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("creates a tooltip element appended directly to document.body", () => {
    const el = getOrCreateTooltip("my-tooltip");
    expect(el.id).toBe("my-tooltip");
    expect(el.parentElement).toBe(document.body);
  });

  it("gives the tooltip fixed positioning so backdrop-filter ancestors can't trap it", () => {
    const el = getOrCreateTooltip("fixed-tooltip");
    expect(el.style.position).toBe("fixed");
    expect(el.style.pointerEvents).toBe("none");
  });

  it("reuses the same element on repeated calls instead of duplicating it", () => {
    const first = getOrCreateTooltip("reused-tooltip");
    const second = getOrCreateTooltip("reused-tooltip");
    expect(first).toBe(second);
    expect(document.querySelectorAll("#reused-tooltip").length).toBe(1);
  });

  it("starts hidden (display: none)", () => {
    const el = getOrCreateTooltip("hidden-tooltip");
    expect(el.style.display).toBe("none");
  });
});
