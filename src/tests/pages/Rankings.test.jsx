import React from "react";
import { mount } from "enzyme";
import { act } from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { MockedProvider } from "@apollo/client/testing";
import Rankings from "../../pages/Rankings";
import { makeStore } from "../../testUtils";
import { TOP_BY_POPULATION, TOP_BY_COVID } from "../../apollo/queries";
import BarChart from "../../components/charts/BarChart";
import BubbleChart from "../../components/charts/BubbleChart";
import TreemapChart from "../../components/charts/TreemapChart";
import LineChart from "../../components/charts/LineChart";
import Loader from "../../components/ui/Loader";

const topPop = Array.from({ length: 20 }, (_, i) => ({
  __typename: "Country",
  code: `C${i}`, name: `Country ${i}`, flag: `flag${i}.svg`,
  population: 100000000 - i * 1000000, density: 100 + i, region: "Asia",
}));

const topCovid = topPop.map((c) => ({
  __typename: "Country",
  code: c.code, name: c.name, flag: c.flag, region: c.region,
  covid: { __typename: "CovidStats", cases: 1000000 + 1000 * Number(c.code.slice(1)), deaths: 0, active: 0, critical: 0, casesPerMillion: 0 },
}));

function mocks() {
  return [
    { request: { query: TOP_BY_POPULATION, variables: { limit: 20 } }, result: { data: { topByPopulation: topPop } } },
    { request: { query: TOP_BY_COVID, variables: { limit: 250 } }, result: { data: { topByCovid: topCovid } } },
  ];
}

async function renderRankings(store = makeStore()) {
  const wrapper = mount(
    <Provider store={store}>
      <MockedProvider mocks={mocks()}>
        <MemoryRouter>
          <Rankings />
        </MemoryRouter>
      </MockedProvider>
    </Provider>
  );
  await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
  wrapper.update();
  return wrapper;
}

describe("<Rankings />", () => {
  it("shows a loader before any ranking data has arrived", () => {
    const store = makeStore();
    const wrapper = mount(
      <Provider store={store}>
        <MockedProvider mocks={mocks()}>
          <MemoryRouter>
            <Rankings />
          </MemoryRouter>
        </MockedProvider>
      </Provider>
    );
    expect(wrapper.find(Loader)).toHaveLength(1);
  });

  it("defaults to the bar chart view with three charts (population, covid, density)", async () => {
    const wrapper = await renderRankings();
    expect(wrapper.find(BarChart)).toHaveLength(3);
  });

  it("switches to the bubble chart when selected", async () => {
    const wrapper = await renderRankings();
    act(() => {
      wrapper.findWhere((n) => n.type() === "button" && n.text().includes("Bubble")).first().simulate("click");
    });
    wrapper.update();
    expect(wrapper.find(BubbleChart)).toHaveLength(1);
    expect(wrapper.find(BarChart)).toHaveLength(0);
  });

  it("switches to the treemap chart when selected", async () => {
    const wrapper = await renderRankings();
    act(() => {
      wrapper.findWhere((n) => n.type() === "button" && n.text().includes("Treemap")).first().simulate("click");
    });
    wrapper.update();
    expect(wrapper.find(TreemapChart)).toHaveLength(1);
  });

  it("switches to the multi-metric line chart when selected", async () => {
    const wrapper = await renderRankings();
    act(() => {
      wrapper.findWhere((n) => n.type() === "button" && n.text().includes("Multi-Metric")).first().simulate("click");
    });
    wrapper.update();
    expect(wrapper.find(LineChart)).toHaveLength(1);
  });

  it("hides the Top-N limit selector for chart types that don't use it", async () => {
    const wrapper = await renderRankings();
    act(() => {
      wrapper.findWhere((n) => n.type() === "button" && n.text().includes("Treemap")).first().simulate("click");
    });
    wrapper.update();
    expect(wrapper.findWhere((n) => n.type() === "button" && n.text() === "Top 10")).toHaveLength(0);
  });

  it("changes the displayed count when a Top-N limit is clicked", async () => {
    const wrapper = await renderRankings();
    act(() => {
      wrapper.findWhere((n) => n.type() === "button" && n.text() === "Top 10").first().simulate("click");
    });
    wrapper.update();
    expect(wrapper.text()).toContain("Top 10 Countries by Population");
  });
});
