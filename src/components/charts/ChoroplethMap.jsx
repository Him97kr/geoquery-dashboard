// src/components/charts/ChoroplethMap.jsx
import { useEffect, useRef, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useQuery } from "@apollo/client";
import { selectMapMetric, setMapMetric } from "../../features/ui/uiSlice";
import { TOP_BY_COVID } from "../../apollo/queries";
import * as d3 from "d3";
import * as topojson from "topojson-client";

const METRICS = [
  { key: "population", label: "Population",  color: "#00e5a0" },
  { key: "density",    label: "Density",     color: "#b4b4f9" },
  { key: "cases",      label: "COVID Cases", color: "#f87171" },
];

// ISO numeric → ISO alpha3 mapping (top 250 countries)
const NUMERIC_TO_ALPHA3 = {
  "004":"AFG","008":"ALB","012":"DZA","024":"AGO","032":"ARG","036":"AUS",
  "040":"AUT","031":"AZE","050":"BGD","056":"BEL","064":"BTN","068":"BOL",
  "070":"BIH","072":"BWA","076":"BRA","096":"BRN","100":"BGR","116":"KHM",
  "120":"CMR","124":"CAN","140":"CAF","144":"LKA","152":"CHL","156":"CHN",
  "170":"COL","178":"COG","180":"COD","188":"CRI","191":"HRV","192":"CUB",
  "196":"CYP","203":"CZE","204":"BEN","208":"DNK","214":"DOM","218":"ECU",
  "818":"EGY","222":"SLV","231":"ETH","246":"FIN","250":"FRA","266":"GAB",
  "276":"DEU","288":"GHA","300":"GRC","320":"GTM","324":"GIN","332":"HTI",
  "340":"HND","348":"HUN","356":"IND","360":"IDN","364":"IRN","368":"IRQ",
  "372":"IRL","376":"ISR","380":"ITA","388":"JAM","392":"JPN","400":"JOR",
  "398":"KAZ","404":"KEN","408":"PRK","410":"KOR","414":"KWT","417":"KGZ",
  "418":"LAO","422":"LBN","430":"LBR","434":"LBY","440":"LTU","442":"LUX",
  "450":"MDG","454":"MWI","458":"MYS","466":"MLI","484":"MEX","496":"MNG",
  "504":"MAR","508":"MOZ","516":"NAM","524":"NPL","528":"NLD","540":"NCL",
  "554":"NZL","558":"NIC","562":"NER","566":"NGA","578":"NOR","512":"OMN",
  "586":"PAK","591":"PAN","600":"PRY","604":"PER","608":"PHL","616":"POL",
  "620":"PRT","634":"QAT","642":"ROU","643":"RUS","646":"RWA","682":"SAU",
  "686":"SEN","694":"SLE","703":"SVK","705":"SVN","706":"SOM","710":"ZAF",
  "724":"ESP","729":"SDN","752":"SWE","756":"CHE","760":"SYR","762":"TJK",
  "764":"THA","768":"TGO","780":"TTO","788":"TUN","792":"TUR","795":"TKM",
  "800":"UGA","804":"UKR","784":"ARE","826":"GBR","840":"USA","858":"URY",
  "860":"UZB","862":"VEN","704":"VNM","887":"YEM","894":"ZMB","716":"ZWE",
  "020":"AND","028":"ATG","044":"BHS","048":"BHR","052":"BRB","084":"BLZ",
  "174":"COM","174":"COM","262":"DJI","212":"DMA","232":"ERI","238":"FLK",
  "242":"FJI","270":"GMB","308":"GRD","328":"GUY","352":"ISL","296":"KIR",
  "426":"LSO","438":"LIE","462":"MDV","466":"MLI","584":"MHL","480":"MUS",
  "583":"FSM","498":"MDA","492":"MCO","520":"NRU","570":"NIU","585":"PLW",
  "598":"PNG","659":"KNA","662":"LCA","670":"VCT","882":"WSM","674":"SMR",
  "678":"STP","690":"SYC","090":"SLB","694":"SLE","706":"SOM","740":"SUR",
  "748":"SWZ","626":"TLS","776":"TON","798":"TUV","548":"VUT","336":"VAT",
};

export default function ChoroplethMap({ countries = [] }) {
  const svgRef    = useRef(null);
  const dispatch  = useDispatch();
  const metric    = useSelector(selectMapMetric);
  const [world,   setWorld]   = useState(null);
  const [hovered, setHovered] = useState(null);

  // Fetch COVID data separately so map has it
  const { data: covidData } = useQuery(TOP_BY_COVID, {
    variables: { limit: 250 },
  });

  // Build alpha3 → covid cases lookup
  const covidLookup = useMemo(() => {
    const map = {};
    covidData?.topByCovid?.forEach((c) => {
      map[c.code] = c.covid?.cases || 0;
    });
    return map;
  }, [covidData]);

  // Build alpha3 → country lookup
  const countryLookup = useMemo(() => {
    const map = {};
    countries.forEach((c) => { map[c.code] = c; });
    return map;
  }, [countries]);

  // Load topojson once
  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then((r) => r.json())
      .then(setWorld);
  }, []);

  useEffect(() => {
    if (!world || !countries.length || !svgRef.current) return;

    const container = svgRef.current.parentElement;
    const W = container.clientWidth || 900;
    const H = 460;

    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width",  W)
      .attr("height", H);

    const projection = d3.geoNaturalEarth1()
      .scale(W / 6.3)
      .translate([W / 2, H / 2]);

    const pathGen = d3.geoPath().projection(projection);

    // getValue using alpha3 lookup — works for all 3 metrics
    const getValue = (alpha3) => {
      const c = countryLookup[alpha3];
      if (!c) return 0;
      if (metric === "population") return c.population || 0;
      if (metric === "density")    return c.density    || 0;
      if (metric === "cases")      return covidLookup[alpha3] || 0;
      return 0;
    };

    const activeMetric = METRICS.find((m) => m.key === metric);

    // Compute values for color scale — filter zeros for log scale
    const allValues = countries.map((c) => getValue(c.code)).filter((v) => v > 0);
    const minVal    = d3.min(allValues) || 1;
    const maxVal    = d3.max(allValues) || 1;

    // Log scale for ALL metrics — linear scale fails when outliers exist:
    // Population: China 1.4B vs Vatican 800
    // Density:    Monaco 26k vs Mongolia 2
    // Cases:      USA 100M vs small islands ~0
    const colorScale = d3.scaleSequentialLog()
      .domain([Math.max(1, minVal), maxVal])
      .interpolator(d3.interpolate("#1a2535", activeMetric.color))
      .clamp(true);

    const geojson = topojson.feature(world, world.objects.countries);

    svg.append("g")
      .selectAll("path")
      .data(geojson.features)
      .join("path")
      .attr("d", pathGen)
      .attr("fill", (feature) => {
        const numericId = String(feature.id).padStart(3, "0");
        const alpha3    = NUMERIC_TO_ALPHA3[numericId];
        if (!alpha3) return "#1f2937";
        const val = getValue(alpha3);
        if (val <= 0) return "#1f2937";
        return colorScale(val);
      })
      .attr("stroke",       "#0d1117")
      .attr("stroke-width", 0.4)
      .attr("opacity",      0.9)
      .on("mouseenter", function (event, feature) {
        const numericId = String(feature.id).padStart(3, "0");
        const alpha3    = NUMERIC_TO_ALPHA3[numericId];
        const c         = alpha3 ? countryLookup[alpha3] : null;
        d3.select(this)
          .attr("opacity", 1)
          .attr("stroke-width", 1.5)
          .attr("stroke", activeMetric.color);
        if (c) {
          setHovered({
            ...c,
            covidCases: covidLookup[alpha3] || 0,
            screenX: event.offsetX,
            screenY: event.offsetY,
          });
        }
      })
      .on("mousemove", (event) => {
        setHovered((prev) =>
          prev ? { ...prev, screenX: event.offsetX, screenY: event.offsetY } : null
        );
      })
      .on("mouseleave", function () {
        d3.select(this)
          .attr("opacity",      0.9)
          .attr("stroke-width", 0.4)
          .attr("stroke",       "#0d1117");
        setHovered(null);
      });

    // Graticule
    svg.append("path")
      .datum(d3.geoGraticule()())
      .attr("d", pathGen)
      .attr("fill",         "none")
      .attr("stroke",       "#1a2332")
      .attr("stroke-width", 0.3);

    // Sphere border
    svg.append("path")
      .datum({ type: "Sphere" })
      .attr("d", pathGen)
      .attr("fill",         "none")
      .attr("stroke",       "#374151")
      .attr("stroke-width", 0.8);

    // ── Legend ──────────────────────────────────────────────────────────────
    const lW = 180, lH = 10;
    const lX = W - lW - 16;
    const lY = H - 32;

    const defs = svg.append("defs");
    const grad = defs.append("linearGradient").attr("id", "cmap-grad");
    grad.append("stop").attr("offset",   "0%").attr("stop-color", "#111827");
    grad.append("stop").attr("offset", "100%").attr("stop-color", activeMetric.color);

    svg.append("rect")
      .attr("x", lX).attr("y", lY)
      .attr("width", lW).attr("height", lH)
      .attr("rx", 3).attr("fill", "url(#cmap-grad)");

    svg.append("text")
      .attr("x", lX).attr("y", lY - 4)
      .attr("fill", "#6b7280").attr("font-size", "10px")
      .text("Low");
    svg.append("text")
      .attr("x", lX + lW).attr("y", lY - 4)
      .attr("fill", "#6b7280").attr("font-size", "10px")
      .attr("text-anchor", "end")
      .text("High");

  }, [world, countries, metric, countryLookup, covidLookup]);

  function fmtVal(c) {
    if (!c) return "";
    if (metric === "population") return ((c.population || 0) / 1e6).toFixed(1) + "M people";
    if (metric === "density")    return (c.density || 0).toFixed(1) + " /km²";
    if (metric === "cases")      return ((c.covidCases || 0) / 1e6).toFixed(2) + "M cases";
    return "";
  }

  return (
    <div className="card w-full">
      {/* Header + metric selector */}
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
      <div className="relative overflow-hidden rounded-lg bg-[#0a0f18]">
        <svg ref={svgRef} className="w-full" />

        {/* Hover tooltip */}
        {hovered && (
          <div
            className="absolute pointer-events-none bg-card border border-border rounded-lg px-3 py-2 text-xs font-mono shadow-xl z-10"
            style={{ left: hovered.screenX + 14, top: Math.max(8, hovered.screenY - 14) }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">{hovered.flag}</span>
              <span className="font-semibold text-white">{hovered.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted">
                {METRICS.find((m) => m.key === metric)?.label}:
              </span>
              <span style={{ color: METRICS.find((m) => m.key === metric)?.color }}>
                {fmtVal(hovered)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
