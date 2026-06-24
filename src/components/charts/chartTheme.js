// src/utils/chartTheme.js
// D3 paints hex strings directly into SVG attributes, so it can't pick up
// Tailwind's CSS-variable-backed colors automatically. This helper reads the
// *current* resolved values of our theme variables at draw time. Each chart
// should call useChartColors() and include `theme` (from uiSlice) in its
// useEffect dependency array so it redraws when the toggle is flipped.

export function readThemeColors() {
  const isDark = document.documentElement.classList.contains("dark");

  return {
    // Hardcoded per-mode (not CSS-var-derived) — D3 needs a concrete, reliable
    // string at draw time, and CSS var lookups via getComputedStyle proved
    // fragile for some calls (fell back to default SVG fill: black).
    teal: isDark ? "#00e5a0" : "#009670",
    tealD: isDark ? "#00a06e" : "#006e50",
    lav: isDark ? "#b4b4f9" : "#635bdb",
    muted: isDark ? "#8b93a7" : "#64748b",
    ink: isDark ? "#ffffff" : "#0f172a",
    red: isDark ? "#f87171" : "#dc2626",
    yellow: isDark ? "#f5c842" : "#b45309",
    // Region palette — same hues, just slightly different weight per mode
    region: {
      Asia: "rgb(var(--color-teal))",
      Europe: "rgb(var(--color-lav))",
      Americas: isDark ? "#f59e0b" : "#b45309",
      Africa: isDark ? "#f87171" : "#dc2626",
      Oceania: isDark ? "#60a5fa" : "#2563eb",
      Antarctic: isDark ? "#94a3b8" : "#64748b",
    },
    // Grid / axis lines — subtle, theme-appropriate
    grid: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
    axisLine: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.15)",
    axisText: "rgb(var(--color-muted))",
    // Tooltip + map-specific surfaces
    tooltipBg: isDark ? "#0d1117" : "#ffffff",
    tooltipBorder: isDark ? "#1f2937" : "#e2e8f0",
    tooltipText: isDark ? "#ffffff" : "#0f172a",
    mapOcean: isDark ? "#0a0f18" : "#eef2f7",
    mapNoData: isDark ? "#1f2937" : "#dbe2ea",
    mapStroke: isDark ? "#0d1117" : "#ffffff",
    isDark,
  };
}

// ── Tooltip portal helper ───────────────────────────────────────────────────
// `.card` uses backdrop-filter for the glass effect, which creates a new
// containing block for any `position: fixed` descendant — a fixed-position
// tooltip nested inside a card ends up positioned relative to that card
// instead of the viewport, and visibly drifts on scroll. The fix is to keep
// each chart's tooltip element as a direct child of <body>, created once and
// reused, so it's never inside a filtered ancestor.
export function getOrCreateTooltip(id) {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("div");
    el.id = id;
    Object.assign(el.style, {
      position: "fixed",
      display: "none",
      pointerEvents: "none",
      borderRadius: "8px",
      padding: "10px 14px",
      fontFamily: "monospace",
      lineHeight: "1.6",
      zIndex: "9999",
    });
    document.body.appendChild(el);
  }
  return el;
}
