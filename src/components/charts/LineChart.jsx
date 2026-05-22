// src/components/charts/LineChart.jsx
import { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function LineChart({ data = [], title }) {
  // data: [{ name, values: [{ label, value }] }]
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const container = svgRef.current.parentElement;
    const W  = container.clientWidth || 600;
    const H  = 380;
    const margin = { top: 20, right: 120, bottom: 50, left: 70 };
    const iW = W  - margin.left - margin.right;
    const iH = H  - margin.top  - margin.bottom;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width",  W)
      .attr("height", H)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const allLabels  = data[0]?.values.map((v) => v.label) || [];
    const allValues  = data.flatMap((d) => d.values.map((v) => v.value));

    const x = d3.scalePoint().domain(allLabels).range([0, iW]);
    const y = d3.scaleLinear()
      .domain([0, d3.max(allValues) * 1.1])
      .range([iH, 0]);

    const colors = ["#00e5a0","#b4b4f9","#f59e0b","#f87171","#60a5fa","#34d399"];

    // Grid
    svg.append("g")
      .call(d3.axisLeft(y).tickSize(-iW).tickFormat(""))
      .call((g) => {
        g.select(".domain").remove();
        g.selectAll(".tick line").attr("stroke","#1f2937").attr("stroke-dasharray","3,3");
      });

    // X axis
    svg.append("g")
      .attr("transform", `translate(0,${iH})`)
      .call(d3.axisBottom(x))
      .call((g) => {
        g.select(".domain").attr("stroke","#1f2937");
        g.selectAll("text").attr("fill","#6b7280").attr("font-size","11px");
        g.selectAll(".tick line").attr("stroke","#1f2937");
      });

    // Y axis
    svg.append("g")
      .call(d3.axisLeft(y).ticks(5).tickFormat((d) => {
        if (d >= 1e9) return (d/1e9).toFixed(1)+"B";
        if (d >= 1e6) return (d/1e6).toFixed(0)+"M";
        return d;
      }))
      .call((g) => {
        g.select(".domain").attr("stroke","#1f2937");
        g.selectAll("text").attr("fill","#6b7280").attr("font-size","11px");
        g.selectAll(".tick line").attr("stroke","#1f2937");
      });

    const line = d3.line()
      .x((d) => x(d.label))
      .y((d) => y(d.value))
      .curve(d3.curveMonotoneX);

    data.forEach((series, i) => {
      const col = colors[i % colors.length];

      // Line path
      const path = svg.append("path")
        .datum(series.values)
        .attr("fill", "none")
        .attr("stroke", col)
        .attr("stroke-width", 2)
        .attr("d", line);

      // Animate draw
      const len = path.node().getTotalLength();
      path
        .attr("stroke-dasharray", len)
        .attr("stroke-dashoffset", len)
        .transition().duration(900).delay(i * 100)
        .attr("stroke-dashoffset", 0);

      // Dots
      svg.selectAll(`.dot-${i}`)
        .data(series.values)
        .join("circle")
        .attr("cx", (d) => x(d.label))
        .attr("cy", (d) => y(d.value))
        .attr("r", 3)
        .attr("fill", col)
        .attr("opacity", 0)
        .transition().delay(900 + i * 100)
        .attr("opacity", 1);

      // Legend
      svg.append("rect")
        .attr("x", iW + 10).attr("y", i * 20)
        .attr("width", 12).attr("height", 3)
        .attr("fill", col).attr("rx", 1);
      svg.append("text")
        .attr("x", iW + 26).attr("y", i * 20 + 4)
        .attr("fill", "#9ca3af").attr("font-size", "11px")
        .text(series.name);
    });

  }, [data]);

  return (
    <div className="card w-full overflow-x-auto">
      {title && <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>}
      <svg ref={svgRef} />
    </div>
  );
}
