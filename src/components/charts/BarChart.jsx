// src/components/charts/BarChart.jsx
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { readThemeColors } from "./chartTheme";

function fmt(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(0) + "K";
  return n;
}

export default function BarChart({ data = [], valueKey = "population", labelKey = "name", color = "#00e5a0", title }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;
    const t = readThemeColors();
    const container = svgRef.current.parentElement;
    const W = container.clientWidth || 600;
    const H = 420;
    const margin = { top: 20, right: 20, bottom: 100, left: 70 };
    const iW = W - margin.left - margin.right;
    const iH = H - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", W)
      .attr("height", H)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(data.map((d) => d[labelKey]))
      .range([0, iW])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d) => d[valueKey]) * 1.1])
      .range([iH, 0]);

    // Grid lines
    svg.append("g")
      .call(d3.axisLeft(y).tickSize(-iW).tickFormat(""))
      .call((g) => {
        g.select(".domain").remove();
        g.selectAll(".tick line")
          .attr("stroke", "#1f2937")
          .attr("stroke-dasharray", "3,3");
      });

    // X axis
    svg.append("g")
      .attr("transform", `translate(0,${iH})`)
      .call(d3.axisBottom(x))
      .call((g) => g.select(".domain").attr("stroke", "#1f2937"))
      .selectAll("text")
      .attr("transform", "rotate(-35)")
      .style("text-anchor", "end")
      .attr("fill", "#6b7280")
      .attr("font-size", "11px");

    // Y axis
    svg.append("g")
      .call(d3.axisLeft(y).tickFormat(fmt).ticks(6))
      .call((g) => {
        g.select(".domain").attr("stroke", "#1f2937");
        g.selectAll("text").attr("fill", "#6b7280").attr("font-size", "11px");
        g.selectAll(".tick line").attr("stroke", "#1f2937");
      });

    // Bars
    svg.selectAll(".bar")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d[labelKey]))
      .attr("y", iH)
      .attr("width", x.bandwidth())
      .attr("height", 0)
      .attr("fill", t[color] || color)
      .attr("rx", 3)
      .attr("opacity", 0.85)
      .transition()
      .duration(600)
      .delay((_, i) => i * 30)
      .attr("y", (d) => y(d[valueKey]))
      .attr("height", (d) => iH - y(d[valueKey]));

    // Value labels on top
    svg.selectAll(".label")
      .data(data)
      .join("text")
      .attr("class", "label")
      .attr("x", (d) => x(d[labelKey]) + x.bandwidth() / 2)
      .attr("y", (d) => y(d[valueKey]) - 4)
      .attr("text-anchor", "middle")
      .attr("fill", t[color] || color)
      .attr("font-size", "10px")
      .attr("font-family", "monospace")
      .attr("opacity", 0)
      .text((d) => fmt(d[valueKey]))
      .transition()
      .delay((_, i) => i * 30 + 600)
      .attr("opacity", 1);

  }, [data, valueKey, labelKey, color]);

  return (
    <div className="card w-full overflow-x-auto">
      {title && <h3 className="text-sm font-semibold text-ink mb-4">{title}</h3>}
      <svg ref={svgRef} />
    </div>
  );
}
