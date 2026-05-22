// src/components/charts/ChoroplethMap.jsx
import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectMapMetric, setMapMetric } from "../../features/ui/uiSlice";
import * as d3 from "d3";
import * as topojson from "topojson-client";

const METRICS = [
  { key: "population", label: "Population",  color: "#00e5a0" },
  { key: "density",    label: "Density",     color: "#b4b4f9" },
  { key: "cases",      label: "COVID Cases", color: "#f87171" },
];

export default function ChoroplethMap({ countries = [] }) {
  const svgRef   = useRef(null);
  const dispatch = useDispatch();
  const metric   = useSelector(selectMapMetric);
  const [world,  setWorld]   = useState(null);
  const [hovered, setHovered] = useState(null);

  // Load world topojson once
  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then((r) => r.json())
      .then(setWorld);
  }, []);

  useEffect(() => {
    if (!world || !countries.length || !svgRef.current) return;

    const container = svgRef.current.parentElement;
    const W = container.clientWidth || 800;
    const H = 440;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width",  W)
      .attr("height", H);

    const projection = d3.geoNaturalEarth1()
      .scale(W / 6.5)
      .translate([W / 2, H / 2]);

    const path = d3.geoPath().projection(projection);

    // Build lookup: ISO numeric → country data
    const lookup = {};
    countries.forEach((c) => {
      lookup[c.code] = c;
    });

    // Colour scale based on selected metric
    const getValue = (c) => {
      if (!c) return 0;
      if (metric === "population") return c.population || 0;
      if (metric === "density")    return c.density    || 0;
      if (metric === "cases")      return c.covid?.cases || 0;
      return 0;
    };

    const activeMetric = METRICS.find((m) => m.key === metric);
    const maxVal = d3.max(countries, getValue) || 1;

    const colorScale = d3.scaleSequential()
      .domain([0, maxVal])
      .interpolator(d3.interpolate("#111827", activeMetric.color));

    // Draw countries
    const geojson = topojson.feature(world, world.objects.countries);

    // Map ISO numeric to alpha3 — use name matching as fallback
    const numericToCountry = {};
    countries.forEach((c) => {
      // We store by code (alpha3); topojson uses numeric IDs
      // We'll match by searching
    });

    svg.append("g")
      .selectAll("path")
      .data(geojson.features)
      .join("path")
      .attr("d", path)
      .attr("fill", (feature) => {
        // Try to find country by matching name
        const name = feature.properties?.name || "";
        const match = countries.find(
          (c) => c.name.toLowerCase() === name.toLowerCase() ||
                 name.toLowerCase().includes(c.name.toLowerCase()) ||
                 c.name.toLowerCase().includes(name.toLowerCase())
        );
        if (!match) return "#1f2937";
        const val = getValue(match);
        return val > 0 ? colorScale(val) : "#1f2937";
      })
      .attr("stroke", "#0d1117")
      .attr("stroke-width", 0.5)
      .attr("opacity", 0.85)
      .on("mouseenter", function (event, feature) {
        const name  = feature.properties?.name || "";
        const match = countries.find(
          (c) => c.name.toLowerCase() === name.toLowerCase() ||
                 name.toLowerCase().includes(c.name.toLowerCase())
        );
        d3.select(this).attr("opacity", 1).attr("stroke-width", 1.5).attr("stroke", activeMetric.color);
        setHovered(match ? { ...match, screenX: event.offsetX, screenY: event.offsetY } : null);
      })
      .on("mousemove", function (event) {
        setHovered((prev) => prev ? { ...prev, screenX: event.offsetX, screenY: event.offsetY } : null);
      })
      .on("mouseleave", function () {
        d3.select(this).attr("opacity", 0.85).attr("stroke-width", 0.5).attr("stroke", "#0d1117");
        setHovered(null);
      });

    // Graticule
    svg.append("path")
      .datum(d3.geoGraticule()())
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "#1f2937")
      .attr("stroke-width", 0.3);

    // Sphere border
    svg.append("path")
      .datum({ type: "Sphere" })
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "#374151")
      .attr("stroke-width", 0.8);

    // Colour legend
    const legendW = 160, legendH = 10;
    const legendX = W - legendW - 20;
    const legendY = H - 36;

    const defs = svg.append("defs");
    const grad = defs.append("linearGradient").attr("id", "legend-grad");
    grad.append("stop").attr("offset", "0%").attr("stop-color", "#111827");
    grad.append("stop").attr("offset","100%").attr("stop-color", activeMetric.color);

    svg.append("rect")
      .attr("x", legendX).attr("y", legendY)
      .attr("width", legendW).attr("height", legendH)
      .attr("rx", 2).attr("fill", "url(#legend-grad)");

    svg.append("text").attr("x", legendX).attr("y", legendY - 4)
      .attr("fill","#6b7280").attr("font-size","10px").text("Low");
    svg.append("text").attr("x", legendX + legendW).attr("y", legendY - 4)
      .attr("fill","#6b7280").attr("font-size","10px").attr("text-anchor","end").text("High");

  }, [world, countries, metric]);

  function fmtVal(c) {
    if (!c) return "";
    if (metric === "population") return (c.population / 1e6).toFixed(1) + "M";
    if (metric === "density")    return c.density?.toFixed(1) + " /km²";
    if (metric === "cases")      return ((c.covid?.cases || 0) / 1e6).toFixed(2) + "M cases";
    return "";
  }

  return (
    <div className="card w-full">
      {/* Metric selector */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">World Map</h3>
        <div className="flex gap-2">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => dispatch(setMapMetric(m.key))}
              className={`badge transition-colors ${
                metric === m.key
                  ? "border-teal text-teal bg-teal/10"
                  : "border-border text-muted hover:border-teal/40"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="relative overflow-hidden rounded-lg">
        <svg ref={svgRef} className="w-full" />
        {/* Hover tooltip */}
        {hovered && (
          <div
            className="absolute pointer-events-none bg-card border border-border rounded-lg px-3 py-2 text-xs font-mono shadow-xl"
            style={{ left: hovered.screenX + 12, top: hovered.screenY - 10 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">{hovered.flag}</span>
              <span className="font-semibold text-white">{hovered.name}</span>
            </div>
            <span className="text-muted">{METRICS.find(m=>m.key===metric)?.label}: </span>
            <span style={{ color: METRICS.find(m=>m.key===metric)?.color }}>{fmtVal(hovered)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
