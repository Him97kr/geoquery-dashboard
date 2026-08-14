import React from "react";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import BubbleChart from "../../../components/charts/BubbleChart";
import { makeStore } from "../../../testUtils";

const data = [
  { name: "India", flag: "in.svg", x: 481.7, y: 1417000000, r: 45000000, region: "Asia" },
  { name: "Brazil", flag: "br.svg", x: 25.4, y: 216000000, r: 38000000, region: "Americas" },
];

function renderChart(props = {}) {
  const store = makeStore();
  return mount(
    <Provider store={store}>
      <BubbleChart data={data} title="Density vs Population" {...props} />
    </Provider>
  );
}

describe("<BubbleChart />", () => {
  it("renders the title", () => {
    const wrapper = renderChart();
    expect(wrapper.text()).toContain("Density vs Population");
  });

  it("draws one bubble per data point", () => {
    const wrapper = renderChart();
    const svgNode = wrapper.find("svg").getDOMNode();
    expect(svgNode.querySelectorAll("circle.bubble").length).toBe(data.length);
  });

  it("renders a region legend entry for every non-Antarctic region", () => {
    const wrapper = renderChart();
    const text = wrapper.text();
    ["Asia", "Europe", "Americas", "Africa", "Oceania"].forEach((region) => {
      expect(text).toContain(region);
    });
    expect(text).not.toContain("Antarctic");
  });

  it("creates a tooltip element appended to document.body", () => {
    renderChart();
    expect(document.getElementById("bubble-tooltip")).toBeTruthy();
  });

  it("renders nothing extra when data is empty", () => {
    const store = makeStore();
    const wrapper = mount(
      <Provider store={store}>
        <BubbleChart data={[]} title="Empty" />
      </Provider>
    );
    const svgNode = wrapper.find("svg").getDOMNode();
    expect(svgNode.querySelectorAll("circle.bubble").length).toBe(0);
  });
});
