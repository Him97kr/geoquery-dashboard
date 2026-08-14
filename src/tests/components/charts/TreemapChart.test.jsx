import React from "react";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import TreemapChart from "../../../components/charts/TreemapChart";
import { makeStore, sampleCountries } from "../../../testUtils";

const data = sampleCountries.map((c) => ({
  name: c.name, flag: c.flag, population: c.population, region: c.region, code: c.code,
}));

function renderChart(props = {}) {
  const store = makeStore();
  return mount(
    <Provider store={store}>
      <TreemapChart data={data} title="World Population" {...props} />
    </Provider>
  );
}

describe("<TreemapChart />", () => {
  it("renders the title", () => {
    const wrapper = renderChart();
    expect(wrapper.text()).toContain("World Population");
  });

  it("draws one leaf cell per data point", () => {
    const wrapper = renderChart();
    const svgNode = wrapper.find("svg").getDOMNode();
    // Each leaf is a <g> containing a <rect>; count rects to count leaves.
    expect(svgNode.querySelectorAll("rect").length).toBe(data.length);
  });

  it("renders a legend entry for every non-Antarctic region", () => {
    const wrapper = renderChart();
    const text = wrapper.text();
    ["Asia", "Europe", "Americas", "Africa", "Oceania"].forEach((region) => {
      expect(text).toContain(region);
    });
  });

  it("creates a tooltip element appended to document.body", () => {
    renderChart();
    expect(document.getElementById("treemap-tooltip")).toBeTruthy();
  });

  it("renders no cells when data is empty", () => {
    const store = makeStore();
    const wrapper = mount(
      <Provider store={store}>
        <TreemapChart data={[]} title="Empty" />
      </Provider>
    );
    const svgNode = wrapper.find("svg").getDOMNode();
    expect(svgNode.querySelectorAll("rect").length).toBe(0);
  });
});
