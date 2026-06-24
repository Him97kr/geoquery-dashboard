// src/utils/chartTheme.js
// D3 paints hex strings directly into SVG attributes, so it can't pick up
// Tailwind's CSS-variable-backed colors automatically. This helper reads the
// *current* resolved values of our theme variables at draw time. Each chart
// should call useChartColors() and include `theme` (from uiSlice) in its
// useEffect dependency array so it redraws when the toggle is flipped.

export function readThemeColors() {
  const css = getComputedStyle(document.documentElement);
  const v = (name) => css.getPropertyValue(name).trim(); // "0 229 160"
  const rgb = (name, alpha = 1) => `rgb(${v(name)} / ${alpha})`;

  const isDark = document.documentElement.classList.contains("dark");

  return {
    teal:   rgb("--color-teal"),
    tealD:  rgb("--color-teal-d"),
    lav:    rgb("--color-lav"),
    muted:  rgb("--color-muted"),
    ink:    rgb("--color-ink"),
    red:    isDark ? "#f87171" : "#dc2626",
    yellow: isDark ? "#f5c842" : "#b45309",
    // Region palette — same hues, just slightly different weight per mode
    region: {
      Asia:      rgb("--color-teal"),
      Europe:    rgb("--color-lav"),
      Americas:  isDark ? "#f59e0b" : "#b45309",
      Africa:    isDark ? "#f87171" : "#dc2626",
      Oceania:   isDark ? "#60a5fa" : "#2563eb",
      Antarctic: isDark ? "#94a3b8" : "#64748b",
    },
    // Grid / axis lines — subtle, theme-appropriate
    grid:      isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
    axisLine:  isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.15)",
    axisText:  rgb("--color-muted"),
    // Tooltip + map-specific surfaces
    tooltipBg:    isDark ? "#0d1117" : "#ffffff",
    tooltipBorder:isDark ? "#1f2937" : "#e2e8f0",
    tooltipText:  isDark ? "#ffffff" : "#0f172a",
    mapOcean:     isDark ? "#0a0f18" : "#eef2f7",
    mapNoData:    isDark ? "#1f2937" : "#dbe2ea",
    mapStroke:    isDark ? "#0d1117" : "#ffffff",
    isDark,
  };
}
