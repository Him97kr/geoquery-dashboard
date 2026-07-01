import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import * as d3 from "d3";
import { selectTheme } from "../../features/ui/uiSlice";
import { useContainerWidth } from "../../hooks/useContainerWidth";
import { readThemeColors, getOrCreateTooltip } from "./chartTheme";

export default function BubbleChart({ data = [], title }) {
  // data: [{ name, flag, x: density, y: population, r: covidCases, region }]
  const svgRef = useRef(null);
  const theme = useSelector(selectTheme);
  const width = useContainerWidth(svgRef);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;
    const t = readThemeColors();
    getOrCreateTooltip("bubble-tooltip");

    const container = svgRef.current.parentElement;
    const W = width || svgRef.current.parentElement.clientWidth || 600;
    const H = 420;
    const margin = { top: 20, right: 20, bottom: 50, left: 70 };
    const iW = W - margin.left - margin.right;
    const iH = H - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", W)
      .attr("height", H)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLog()
      .domain([1, d3.max(data, (d) => d.x) * 1.2])
      .range([0, iW]);

    const y = d3.scaleLog()
      .domain([100000, d3.max(data, (d) => d.y) * 1.2])
      .range([iH, 0]);

    const maxCases = d3.max(data, (d) => d.r) || 1;

    const r = d3.scaleSqrt()
      .domain([0, maxCases])
      .range([4, Math.min(iW, iH) * 0.12]); // max bubble = 12% of chart dimension

    const regionColors = t.region;

    // Grid
    svg.append("g")
      .call(d3.axisLeft(y).tickSize(-iW).tickFormat(""))
      .call((g) => {
        g.select(".domain").remove();
        g.selectAll(".tick line").attr("stroke", t.grid).attr("stroke-dasharray", "3,3");
      });

    // X axis
    svg.append("g")
      .attr("transform", `translate(0,${iH})`)
      .call(d3.axisBottom(x).ticks(5, ".0s"))
      .call((g) => {
        g.select(".domain").attr("stroke", t.axisLine);
        g.selectAll("text").attr("fill", t.axisText).attr("font-size", "11px");
        g.selectAll(".tick line").attr("stroke", t.grid);
      });

    // Y axis
    svg.append("g")
      .call(d3.axisLeft(y).ticks(5, ".2s"))
      .call((g) => {
        g.select(".domain").attr("stroke", t.axisLine);
        g.selectAll("text").attr("fill", t.axisText).attr("font-size", "11px");
        g.selectAll(".tick line").attr("stroke", t.grid);
      });

    // Axis labels
    svg.append("text")
      .attr("x", iW / 2).attr("y", iH + 42)
      .attr("fill", t.axisText).attr("font-size", "12px").attr("text-anchor", "middle")
      .text("Population Density (log scale)");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -iH / 2).attr("y", -55)
      .attr("fill", t.axisText).attr("font-size", "12px").attr("text-anchor", "middle")
      .text("Population (log scale)");

    // Bubbles
    svg.selectAll(".bubble")
      .data(data)
      .join("circle")
      .attr("class", "bubble")
      .attr("cx", (d) => x(Math.max(1, d.x)))
      .attr("cy", (d) => y(Math.max(100000, d.y)))
      .attr("r", 0)
      .attr("fill", (d) => regionColors[d.region] || t.teal)
      .attr("opacity", 0.65)
      .attr("stroke", (d) => regionColors[d.region] || t.teal)
      .attr("stroke-width", 1)
      .on("mouseenter", function (event, d) {
        d3.select(this).attr("opacity", 1).attr("stroke-width", 2);
        d3.select("#bubble-tooltip")
          .style("display", "block")
          .style("left", event.pageX + 12 + "px")
          .style("top", event.pageY - 28 + "px")
          .style("background", t.tooltipBg)
          .style("border", `1px solid ${t.tooltipBorder}`)
          .style("color", t.tooltipText)
          .html(`
            <span style="display:flex">
            <img style="width:24px; height:16px;" src=${d.flag} alt=${d.name} />
            <strong style="color:${t.tooltipText};margin-left:6px">${d.name}</strong>
            </span>
            <span style="color:${t.muted};font-size:11px">Population: </span>
            <span style="color:${t.teal};font-size:11px">${(d.y / 1e6).toFixed(1)}M</span><br/>
            <span style="color:${t.muted};font-size:11px">Density: </span>
            <span style="color:${t.lav};font-size:11px">${d.x.toFixed(1)}/km²</span><br/>
            <span style="color:${t.muted};font-size:11px">COVID Cases: </span>
            <span style="color:${t.red};font-size:11px">${(d.r / 1e6).toFixed(2)}M</span>
          `);
      })
      .on("mouseleave", function () {
        d3.select(this).attr("opacity", 0.65).attr("stroke-width", 1);
        d3.select("#bubble-tooltip").style("display", "none");
      })
      .transition().duration(600).delay((_, i) => i * 15)
      .attr("r", (d) => r(d.r));

    // Country flag labels for large bubbles
    svg.selectAll(".flag-label")
      .data(data.filter((d) => d.r > maxCases * 0.3))
      .join("image")
      .attr("class", "flag-label")
      .attr("href", (d) => d.flag)
      .attr("width", 24)
      .attr("height", 16)
      .attr("x", (d) => x(Math.max(1, d.x)) - 12) // Centers the image horizontally
      .attr("y", (d) => y(Math.max(100000, d.y)) - 7)
      .attr("opacity", 0)
      .transition().delay(800)
      .attr("opacity", 1);

  }, [data, width, theme]);

  return (
    <div className="card w-full overflow-x-auto">
      {title && <h3 className="text-sm font-semibold text-ink mb-4">{title}</h3>}
      <svg ref={svgRef} />
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 px-2">
        {Object.entries(readThemeColors().region).filter(([r]) => r !== "Antarctic").map(([region, color]) => (
          <div key={region} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: color }} />
            <span className="text-xs text-muted">{region}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
