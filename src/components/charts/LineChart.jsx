// src/components/charts/LineChart.jsx
// Shows 3 normalized lines (Population, Density, COVID Cases)
// for top N populated countries on the same scale (0–100 index)
import { useEffect, useRef } from "react";
import * as d3 from "d3";

const LINES = [
  { key: "population", label: "Population",  color: "#00e5a0" },
  { key: "density",    label: "Density",     color: "#b4b4f9" },
  { key: "covidCases", label: "COVID Cases", color: "#f87171" },
];

export default function LineChart({ data = [], title }) {
  // data: [{ name, flag, population, density, covidCases }]
  // All values normalized 0-100 so 3 metrics visible on same axis
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const container = svgRef.current.parentElement;
    const W  = container.clientWidth || 700;
    const H  = 420;
    const margin = { top: 24, right: 160, bottom: 110, left: 50 };
    const iW = W  - margin.left - margin.right;
    const iH = H  - margin.top  - margin.bottom;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width",  W)
      .attr("height", H)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Normalize each metric 0–100
    const normalize = (key) => {
      const vals = data.map((d) => d[key] || 0);
      const min  = d3.min(vals);
      const max  = d3.max(vals) || 1;
      return data.map((d) => ({
        name:       d.name,
        flag:       d.flag,
        raw:        d[key] || 0,
        normalized: ((d[key] || 0) - min) / (max - min) * 100,
      }));
    };

    const series = LINES.map((line) => ({
      ...line,
      points: normalize(line.key),
    }));

    // Scales
    const x = d3.scalePoint()
      .domain(data.map((d) => d.name))
      .range([0, iW])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, 100])
      .range([iH, 0]);

    // Grid lines
    svg.append("g")
      .call(d3.axisLeft(y).tickSize(-iW).tickFormat("").ticks(5))
      .call((g) => {
        g.select(".domain").remove();
        g.selectAll(".tick line")
          .attr("stroke", "#1f2937")
          .attr("stroke-dasharray", "3,3");
      });

    // Y axis — labeled as "Index (0–100)"
    svg.append("g")
      .call(d3.axisLeft(y).ticks(5).tickFormat((d) => d))
      .call((g) => {
        g.select(".domain").attr("stroke", "#1f2937");
        g.selectAll("text").attr("fill", "#6b7280").attr("font-size", "11px");
        g.selectAll(".tick line").attr("stroke", "#1f2937");
      });

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -iH / 2).attr("y", -38)
      .attr("text-anchor", "middle")
      .attr("fill", "#6b7280").attr("font-size", "10px")
      .text("Normalized Index (0 = lowest, 100 = highest)");

    // X axis — flags + rotated names
    const xAxisG = svg.append("g")
      .attr("transform", `translate(0,${iH})`)
      .call(d3.axisBottom(x).tickSize(0))
      .call((g) => g.select(".domain").attr("stroke", "#1f2937"));

    xAxisG.selectAll(".tick text").remove();

    data.forEach((d) => {
      const xPos = x(d.name);
      // Flag
      svg.append("text")
        .attr("x", xPos).attr("y", iH + 18)
        .attr("text-anchor", "middle")
        .attr("font-size", "13px")
        .text(d.flag || "🌍");
      // Name rotated
      svg.append("text")
        .attr("x", xPos).attr("y", iH + 34)
        .attr("text-anchor", "end")
        .attr("transform", `rotate(-40, ${xPos}, ${iH + 34})`)
        .attr("fill", "#6b7280")
        .attr("font-size", "10px")
        .text(d.name.length > 12 ? d.name.slice(0, 11) + "…" : d.name);
    });

    // Tooltip
    const tooltipEl = d3.select("#linechart-tooltip");

    // Draw lines + dots per series
    const lineGen = d3.line()
      .x((d) => x(d.name))
      .y((d) => y(d.normalized))
      .curve(d3.curveMonotoneX);

    series.forEach((s, si) => {
      // Line path with draw animation
      const path = svg.append("path")
        .datum(s.points)
        .attr("fill",         "none")
        .attr("stroke",       s.color)
        .attr("stroke-width", 2)
        .attr("opacity",      0.9)
        .attr("d",            lineGen);

      const len = path.node().getTotalLength();
      path
        .attr("stroke-dasharray",  len)
        .attr("stroke-dashoffset", len)
        .transition()
        .duration(900)
        .delay(si * 150)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

      // Dots
      svg.selectAll(`.dot-${si}`)
        .data(s.points)
        .join("circle")
        .attr("cx",      (d) => x(d.name))
        .attr("cy",      (d) => y(d.normalized))
        .attr("r",       4)
        .attr("fill",    s.color)
        .attr("stroke",  "#0d1117")
        .attr("stroke-width", 1.5)
        .attr("opacity", 0)
        .on("mouseenter", function (event, d) {
          d3.select(this).attr("r", 6);
          tooltipEl
            .style("display", "block")
            .style("left",  event.pageX + 12 + "px")
            .style("top",   event.pageY - 32 + "px")
            .html(`
              <span style="font-size:16px">${d.flag}</span>
              <strong style="color:#fff;margin-left:6px">${d.name}</strong><br/>
              <span style="color:${s.color};font-size:11px">
                ${s.label}: ${fmtRaw(s.key, d.raw)}
              </span><br/>
              <span style="color:#6b7280;font-size:10px">
                Index: ${d.normalized.toFixed(1)} / 100
              </span>
            `);
        })
        .on("mouseleave", function () {
          d3.select(this).attr("r", 4);
          tooltipEl.style("display", "none");
        })
        .transition()
        .delay(900 + si * 150)
        .attr("opacity", 1);

      // Legend
      const legendY = si * 22;
      svg.append("line")
        .attr("x1", iW + 16).attr("y1", legendY + 8)
        .attr("x2", iW + 36).attr("y2", legendY + 8)
        .attr("stroke", s.color).attr("stroke-width", 2);
      svg.append("circle")
        .attr("cx", iW + 26).attr("cy", legendY + 8)
        .attr("r",  3).attr("fill", s.color);
      svg.append("text")
        .attr("x", iW + 42).attr("y", legendY + 12)
        .attr("fill", "#9ca3af").attr("font-size", "12px")
        .text(s.label);
    });

  }, [data]);

  return (
    <div className="card w-full overflow-x-auto">
      {title && <h3 className="text-sm font-semibold text-ink mb-4">{title}</h3>}

      <p className="text-xs text-muted mb-3 font-mono">
        All metrics normalized to 0–100 index for visual comparison. Hover dots for raw values.
      </p>

      <div
        id="linechart-tooltip"
        style={{
          display: "none", position: "fixed", pointerEvents: "none",
          background: "#0d1117", border: "1px solid #1f2937",
          borderRadius: "8px", padding: "10px 14px",
          fontFamily: "monospace", zIndex: 9999, lineHeight: "1.8",
        }}
      />

      <svg ref={svgRef} />
    </div>
  );
}

function fmtRaw(key, val) {
  if (!val && val !== 0) return "N/A";
  if (key === "population") {
    if (val >= 1e9) return (val / 1e9).toFixed(2) + "B";
    if (val >= 1e6) return (val / 1e6).toFixed(1) + "M";
    return val.toLocaleString();
  }
  if (key === "density")    return val.toFixed(1) + " /km²";
  if (key === "covidCases") {
    if (val >= 1e6) return (val / 1e6).toFixed(1) + "M";
    if (val >= 1e3) return (val / 1e3).toFixed(0) + "K";
    return val.toLocaleString();
  }
  return val;
}
