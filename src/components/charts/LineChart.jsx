// Shows up to 3 normalized lines (Population, Density, COVID Cases)
// for top N populated countries on the same scale (0–100 index).
// Each line can be toggled on/off via the legend buttons above the chart.
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import * as d3 from "d3";
import { selectTheme } from "../../features/ui/uiSlice";
import { useContainerWidth } from "../../hooks/useContainerWidth";
import { readThemeColors, getOrCreateTooltip } from "./chartTheme";

const ALL_LINES = [
  { key: "population", label: "Population" },
  { key: "density", label: "Density" },
  { key: "covidCases", label: "COVID Cases" },
];

export default function LineChart({ data = [], title }) {
  // data: [{ name, flag, population, density, covidCases }]
  // All values normalized 0-100 so multiple metrics stay comparable on the same axis
  const svgRef = useRef(null);
  const theme = useSelector(selectTheme);
  const width = useContainerWidth(svgRef);

  // Per-metric visibility — all on by default
  const [visible, setVisible] = useState({
    population: true,
    density: true,
    covidCases: true,
  });

  function toggleSeries(key) {
    setVisible((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // Don't allow turning off the last remaining line — leaves an empty chart
      const anyVisible = Object.values(next).some(Boolean);
      return anyVisible ? next : prev;
    });
  }

  useEffect(() => {
    if (!data.length || !svgRef.current) return;
    const t = readThemeColors();
    getOrCreateTooltip("linechart-tooltip");

    const COLORS = { population: t.teal, density: t.lav, covidCases: t.red };
    const LINES = ALL_LINES
      .filter((l) => visible[l.key])
      .map((l) => ({ ...l, color: COLORS[l.key] }));

    const container = svgRef.current.parentElement;
    const W = width || svgRef.current.parentElement.clientWidth || 700;
    const H = 420;
    const margin = { top: 24, right: 20, bottom: 110, left: 50 };
    const iW = W - margin.left - margin.right;
    const iH = H - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", W)
      .attr("height", H)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    if (!LINES.length) return;

    // Normalize each metric 0–100
    const normalize = (key) => {
      const vals = data.map((d) => d[key] || 0);
      const min = d3.min(vals);
      const max = d3.max(vals) || 1;
      const span = max - min || 1;
      return data.map((d) => ({
        name: d.name,
        flag: d.flag,
        raw: d[key] || 0,
        normalized: ((d[key] || 0) - min) / span * 100,
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
        g.selectAll(".tick line").attr("stroke", t.grid).attr("stroke-dasharray", "3,3");
      });

    // Y axis — labeled as "Index (0–100)"
    svg.append("g")
      .call(d3.axisLeft(y).ticks(5).tickFormat((d) => d))
      .call((g) => {
        g.select(".domain").attr("stroke", t.axisLine);
        g.selectAll("text").attr("fill", t.axisText).attr("font-size", "11px");
        g.selectAll(".tick line").attr("stroke", t.grid);
      });

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -iH / 2).attr("y", -38)
      .attr("text-anchor", "middle")
      .attr("fill", t.axisText).attr("font-size", "10px")
      .text("Normalized Index (0 = lowest, 100 = highest)");

    // X axis — flags + rotated names
    const xAxisG = svg.append("g")
      .attr("transform", `translate(0,${iH})`)
      .call(d3.axisBottom(x).tickSize(0))
      .call((g) => g.select(".domain").attr("stroke", t.axisLine));

    xAxisG.selectAll(".tick text").remove();

    data.forEach((d) => {
      const xPos = x(d.name);
      // Flag
      svg.append("image")
        .attr("x", xPos - 12).attr("y", iH + 6)
        .attr("width", 24)
        .attr("height", 16)
        .attr("href", d.flag || "");
      // Name rotated
      svg.append("text")
        .attr("x", xPos).attr("y", iH + 34)
        .attr("text-anchor", "end")
        .attr("transform", `rotate(-40, ${xPos}, ${iH + 34})`)
        .attr("fill", t.axisText)
        .attr("font-size", "10px")
        .text(d.name.length > 12 ? d.name.slice(0, 11) + "…" : d.name);
    });

    // Draw lines + dots per series
    const lineGen = d3.line()
      .x((d) => x(d.name))
      .y((d) => y(d.normalized))
      .curve(d3.curveMonotoneX);

    series.forEach((s, si) => {
      // Line path with draw animation
      const path = svg.append("path")
        .datum(s.points)
        .attr("fill", "none")
        .attr("stroke", s.color)
        .attr("stroke-width", 2)
        .attr("opacity", 0.9)
        .attr("d", lineGen);

      const len = path.node().getTotalLength();
      path
        .attr("stroke-dasharray", len)
        .attr("stroke-dashoffset", len)
        .transition()
        .duration(900)
        .delay(si * 150)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

      // Dots
      svg.selectAll(`.dot-${s.key}`)
        .data(s.points)
        .join("circle")
        .attr("cx", (d) => x(d.name))
        .attr("cy", (d) => y(d.normalized))
        .attr("r", 4)
        .attr("fill", s.color)
        .attr("stroke", t.tooltipBg)
        .attr("stroke-width", 1.5)
        .attr("opacity", 0)
        .on("mouseenter", function (event, d) {
          d3.select(this).attr("r", 6);
          d3.select("#linechart-tooltip")
            .style("display", "block")
            .style("left", event.clientX + 12 + "px")
            .style("top", event.clientY - 32 + "px")
            .style("background", t.tooltipBg)
            .style("border", `1px solid ${t.tooltipBorder}`)
            .style("color", t.tooltipText)
            .html(`
              <span style="display:flex">
              <img style="width:24px; height:16px;" src=${d.flag} alt=${d.name} />
              <strong style="color:${t.tooltipText};margin-left:6px">${d.name}</strong>
              </span>
              <span style="color:${s.color};font-size:11px">
                ${s.label}: ${fmtRaw(s.key, d.raw)}
              </span><br/>
              <span style="color:${t.muted};font-size:10px">
                Index: ${d.normalized.toFixed(1)} / 100
              </span>
            `);
        })
        .on("mouseleave", function () {
          d3.select(this).attr("r", 4);
          d3.select("#linechart-tooltip").style("display", "none");
        })
        .transition()
        .delay(900 + si * 150)
        .attr("opacity", 1);
    });

  }, [data, width, theme, visible]);

  return (
    <div className="card w-full overflow-x-auto">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-2">
        {title && <h3 className="text-sm font-semibold text-ink">{title}</h3>}

        {/* Series toggle legend */}
        <div className="flex items-center gap-2 flex-wrap">
          {ALL_LINES.map(({ key, label }) => {
            const t = readThemeColors();
            const color = { population: t.teal, density: t.lav, covidCases: t.red }[key];
            const isOn = visible[key];
            return (
              <button
                key={key}
                type="button"
                aria-pressed={isOn}
                onClick={() => toggleSeries(key)}
                className="badge transition-colors inline-flex items-center gap-1.5"
                style={
                  isOn
                    ? { borderColor: `${color}66`, color, background: `${color}1a` }
                    : { borderColor: "rgb(var(--color-border) / 0.5)", color: "rgb(var(--color-muted))", opacity: 0.6 }
                }
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: isOn ? color : "rgb(var(--color-muted))" }}
                />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-muted mb-3 font-mono">
        All metrics normalized to 0–100 index for visual comparison. Hover dots for raw values. Click a legend badge to show/hide that line.
      </p>

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
  if (key === "density") return val.toFixed(1) + " /km²";
  if (key === "covidCases") {
    if (val >= 1e6) return (val / 1e6).toFixed(1) + "M";
    if (val >= 1e3) return (val / 1e3).toFixed(0) + "K";
    return val.toLocaleString();
  }
  return val;
}
