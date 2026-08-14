import React from "react";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import BarChart from "../../../components/charts/BarChart";
import { makeStore } from "../../../testUtils";

const data = [
  { name: "China", population: 1412000000 },
  { name: "India", population: 1417000000 },
  { name: "USA", population: 331000000 },
];

function renderChart(props = {}) {
  const store = makeStore();
  return mount(
    <Provider store={store}>
      <BarChart data={data} title="Top Countries" {...props} />
    </Provider>
  );
}

describe("<BarChart />", () => {
  it("renders the title", () => {
    const wrapper = renderChart();
    expect(wrapper.text()).toContain("Top Countries");
  });

  it("renders an svg element", () => {
    const wrapper = renderChart();
    expect(wrapper.find("svg")).toHaveLength(1);
  });

  it("draws one bar rect per data point", () => {
    const wrapper = renderChart();
    // D3 draws directly into the DOM, so inspect the mounted svg node rather
    // than Enzyme's virtual tree.
    const svgNode = wrapper.find("svg").getDOMNode();
    const bars = svgNode.querySelectorAll("rect.bar");
    expect(bars.length).toBe(data.length);
  });

  it("draws one axis label per data point", () => {
    const wrapper = renderChart();
    const svgNode = wrapper.find("svg").getDOMNode();
    const labels = svgNode.querySelectorAll("text.label");
    expect(labels.length).toBe(data.length);
  });

  it("renders no title element when title prop is omitted", () => {
    const store = makeStore();
    const wrapper = mount(
      <Provider store={store}>
        <BarChart data={data} />
      </Provider>
    );
    expect(wrapper.find("h3")).toHaveLength(0);
  });

  it("renders no bars when data is empty", () => {
    const store = makeStore();
    const wrapper = mount(
      <Provider store={store}>
        <BarChart data={[]} title="Empty" />
      </Provider>
    );
    const svgNode = wrapper.find("svg").getDOMNode();
    expect(svgNode.querySelectorAll("rect.bar").length).toBe(0);
  });
});
