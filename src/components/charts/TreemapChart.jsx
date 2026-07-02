import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import * as d3 from "d3";
import { selectTheme } from "../../features/ui/uiSlice";
import { useContainerWidth } from "../../hooks/useContainerWidth";
import { readThemeColors, getOrCreateTooltip } from "./chartTheme";

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
  const theme = useSelector(selectTheme);
  const width = useContainerWidth(svgRef);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;
    const t = readThemeColors();
    const regionColors = t.region;
    getOrCreateTooltip("treemap-tooltip");

    const container = svgRef.current.parentElement;
    const W = width || svgRef.current.parentElement.clientWidth || 800;
    const H = 480;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", W)
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

    const cell = svg.selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

    // Rect
    cell.append("rect")
      .attr("width", (d) => Math.max(0, d.x1 - d.x0))
      .attr("height", (d) => Math.max(0, d.y1 - d.y0))
      .attr("fill", (d) => regionColors[d.data.region] || t.muted)
      .attr("opacity", 0.75)
      .attr("rx", 3)
      .on("mouseenter", function (event, d) {
        d3.select(this).attr("opacity", 1);
        d3.select("#treemap-tooltip")
          .style("display", "block")
          .style("left", event.clientX + 12 + "px")
          .style("top", event.clientY - 28 + "px")
          .style("background", t.tooltipBg)
          .style("border", `1px solid ${t.tooltipBorder}`)
          .style("color", t.tooltipText)
          .html(`
            <span style="display:flex">
            <img style="width:24px; height:16px;" src=${d.data.flag} alt=${d.data.name} />
            <strong style="color:${t.tooltipText};margin-left:6px">${d.data.name}</strong>
            </span>
            <span style="color:${t.muted};font-size:11px">Population: </span>
            <span style="color:${t.teal};font-size:11px">${fmt(d.data.population)}</span><br/>
            <span style="color:${t.muted};font-size:11px">Region: </span>
            <span style="color:${t.lav};font-size:11px">${d.data.region}</span><br/>
            <span style="color:${t.muted};font-size:11px">Share: </span>
            <span style="color:${t.yellow};font-size:11px">${((d.data.population / root.value) * 100).toFixed(2)}%</span>
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
        g.append("image")
          .attr("x", w / 2 - 12)
          .attr("y", h / 2 - 16)
          .attr("width", 24)
          .attr("height", 16)
          .attr("href", d.data.flag);

        // Country name
        if (h > 55) {
          g.append("text")
            .attr("x", w / 2)
            .attr("y", h / 2 + 12)
            .attr("text-anchor", "middle")
            .attr("fill", t.isDark ? "#fff" : "#0f172a")
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
            .attr("fill", t.isDark ? "#fff" : "#0f172a")
            .attr("font-size", "9px")
            .attr("font-family", "monospace")
            .text(fmt(d.data.population));
        }
      }
    });

  }, [data, width, theme]);

  return (
    <div className="card w-full overflow-hidden">
      {title && <h3 className="text-sm font-semibold text-ink mb-4">{title}</h3>}

      <svg ref={svgRef} className="w-full rounded-lg" />

      {/* Region legend */}
      <div className="flex flex-wrap gap-3 mt-3 px-1">
        {Object.entries(readThemeColors().region).filter(([r]) => r !== "Antarctic").map(([region, color]) => (
          <div key={region} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: color, opacity: 0.8 }} />
            <span className="text-xs text-muted">{region}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
