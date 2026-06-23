// src/components/charts/TreemapChart.jsx
import { useEffect, useRef } from "react";
import * as d3 from "d3";

const REGION_COLORS = {
  Asia:     "#00e5a0",
  Europe:   "#b4b4f9",
  Americas: "#f59e0b",
  Africa:   "#f87171",
  Oceania:  "#60a5fa",
  Antarctic:"#94a3b8",
};

function fmt(n) {
  if (!n) return "N/A";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(0) + "K";
  return n;
}

export default function TreemapChart({ data = [], title }) {
  // data: [{ name, flag, population, region, code }]
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const container = svgRef.current.parentElement;
    const W = container.clientWidth || 800;
    const H = 480;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width",  W)
      .attr("height", H);

    // Build hierarchy
    const root = d3.hierarchy({
      name: "world",
      children: data.map((d) => ({ ...d, value: d.population })),
    })
    .sum((d) => d.value)
    .sort((a, b) => b.value - a.value);

    d3.treemap()
      .size([W, H])
      .paddingOuter(3)
      .paddingInner(2)
      .round(true)(root);

    const tooltip = d3.select("body").select("#treemap-tooltip");

    const cell = svg.selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

    // Rect
    cell.append("rect")
      .attr("width",  (d) => Math.max(0, d.x1 - d.x0))
      .attr("height", (d) => Math.max(0, d.y1 - d.y0))
      .attr("fill",   (d) => REGION_COLORS[d.data.region] || "#6b7280")
      .attr("opacity", 0.75)
      .attr("rx", 3)
      .on("mouseenter", function (event, d) {
        d3.select(this).attr("opacity", 1);
        d3.select("#treemap-tooltip")
          .style("display", "block")
          .style("left",  event.pageX + 12 + "px")
          .style("top",   event.pageY - 28 + "px")
          .html(`
            <span style="font-size:18px">${d.data.flag || "🌍"}</span>
            <strong style="color:#fff;margin-left:6px">${d.data.name}</strong><br/>
            <span style="color:#6b7280;font-size:11px">Population: </span>
            <span style="color:#00e5a0;font-size:11px">${fmt(d.data.population)}</span><br/>
            <span style="color:#6b7280;font-size:11px">Region: </span>
            <span style="color:#b4b4f9;font-size:11px">${d.data.region}</span><br/>
            <span style="color:#6b7280;font-size:11px">Share: </span>
            <span style="color:#f59e0b;font-size:11px">${((d.data.population / root.value) * 100).toFixed(2)}%</span>
          `);
      })
      .on("mouseleave", function () {
        d3.select(this).attr("opacity", 0.75);
        d3.select("#treemap-tooltip").style("display", "none");
      });

    // Flag + name label (only if cell is big enough)
    cell.each(function (d) {
      const w = d.x1 - d.x0;
      const h = d.y1 - d.y0;
      const g = d3.select(this);

      if (w > 50 && h > 36) {
        // Flag
        g.append("text")
          .attr("x", w / 2)
          .attr("y", h / 2 - (h > 55 ? 10 : 4))
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("font-size", Math.min(w, h) > 80 ? "20px" : "13px")
          .text(d.data.flag || "");

        // Country name
        if (h > 55) {
          g.append("text")
            .attr("x", w / 2)
            .attr("y", h / 2 + 12)
            .attr("text-anchor", "middle")
            .attr("fill", "#fff")
            .attr("font-size", "10px")
            .attr("font-family", "monospace")
            .text(d.data.name.length > 14 ? d.data.name.slice(0, 12) + "…" : d.data.name);
        }

        // Population
        if (w > 80 && h > 68) {
          g.append("text")
            .attr("x", w / 2)
            .attr("y", h / 2 + 26)
            .attr("text-anchor", "middle")
            .attr("fill", REGION_COLORS[d.data.region] || "#6b7280")
            .attr("font-size", "9px")
            .attr("font-family", "monospace")
            .text(fmt(d.data.population));
        }
      }
    });

  }, [data]);

  return (
    <div className="card w-full overflow-hidden">
      {title && <h3 className="text-sm font-semibold text-ink mb-4">{title}</h3>}

      {/* Tooltip */}
      <div
        id="treemap-tooltip"
        style={{
          display: "none", position: "fixed", pointerEvents: "none",
          background: "#0d1117", border: "1px solid #1f2937",
          borderRadius: "8px", padding: "10px 14px",
          fontFamily: "monospace", zIndex: 9999, lineHeight: "1.8",
        }}
      />

      <svg ref={svgRef} className="w-full rounded-lg" />

      {/* Region legend */}
      <div className="flex flex-wrap gap-3 mt-3 px-1">
        {Object.entries(REGION_COLORS).filter(([r]) => r !== "Antarctic").map(([region, color]) => (
          <div key={region} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: color, opacity: 0.8 }} />
            <span className="text-xs text-muted">{region}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
