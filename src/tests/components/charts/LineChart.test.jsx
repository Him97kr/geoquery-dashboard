import React from "react";
import { mount } from "enzyme";
import { act } from "react";
import { Provider } from "react-redux";
import LineChart from "../../../components/charts/LineChart";
import { makeStore } from "../../../testUtils";

const data = [
  { name: "China", flag: "cn.svg", population: 1412000000, density: 148, covidCases: 99000000 },
  { name: "India", flag: "in.svg", population: 1417000000, density: 481, covidCases: 45000000 },
  { name: "USA", flag: "us.svg", population: 331000000, density: 36, covidCases: 103000000 },
];

function renderChart(props = {}) {
  const store = makeStore();
  return mount(
    <Provider store={store}>
      <LineChart data={data} title="Multi-Metric" {...props} />
    </Provider>
  );
}

describe("<LineChart />", () => {
  it("renders the title", () => {
    const wrapper = renderChart();
    expect(wrapper.text()).toContain("Multi-Metric");
  });

  it("renders a toggle badge for each of the three metrics", () => {
    const wrapper = renderChart();
    ["Population", "Density", "COVID Cases"].forEach((label) => {
      expect(wrapper.text()).toContain(label);
    });
  });

  it("draws three line paths by default (all series visible)", () => {
    const wrapper = renderChart();
    const svgNode = wrapper.find("svg").getDOMNode();
    expect(svgNode.querySelectorAll("path:not(.domain)").length).toBe(3);
  });

  it("draws one dot circle per data point per visible series", () => {
    const wrapper = renderChart();
    const svgNode = wrapper.find("svg").getDOMNode();
    expect(svgNode.querySelectorAll("circle").length).toBe(data.length * 3);
  });

  it("removes a line when its legend badge is toggled off", () => {
    const wrapper = renderChart();
    const badges = wrapper.find("button[aria-pressed=true]");
    act(() => {
      badges.first().simulate("click");
    });
    wrapper.update();
    const svgNode = wrapper.find("svg").getDOMNode();
    expect(svgNode.querySelectorAll("path:not(.domain)").length).toBe(2);
  });

  it("does not allow turning off the last remaining series", () => {
    const wrapper = renderChart();
    const clickAll = () => {
      const badges = wrapper.find('button[aria-pressed=true]');
      act(() => { badges.first().simulate("click"); });
      wrapper.update();
    };
    clickAll();
    clickAll();
    clickAll(); // attempt to turn off the last one — should be a no-op
    wrapper.update();
    const remaining = wrapper.find('button[aria-pressed=true]');
    expect(remaining.length).toBe(1);
  });
});
