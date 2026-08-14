import React from "react";
import { mount } from "enzyme";
import { act } from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { MockedProvider } from "@apollo/client/testing";
import Home from "../../pages/Home";
import { makeStore } from "../../testUtils";
import { GLOBAL_STATS, GET_COUNTRIES, TOP_BY_COVID } from "../../apollo/queries";
import Loader from "../../components/ui/Loader";

const globalStatsData = {
  totalCountries: 195,
  totalPopulation: "8000000000",
  totalCovidCases: 700000000,
  totalCovidDeaths: 6900000,
  totalActive: 4000000,
  mostPopulated: { __typename: "Country", name: "India", code: "IND", flag: "in.svg", population: 1417000000 },
  leastPopulated: { __typename: "Country", name: "Nauru", code: "NRU", flag: "nr.svg", population: 12000 },
  highestDensity: { __typename: "Country", name: "Monaco", code: "MCO", flag: "mc.svg", density: 26000 },
  mostCovidCases: { __typename: "Country", name: "USA", code: "USA", flag: "us.svg", covid: { __typename: "CovidStats", cases: 103000000, deaths: 1100000 } },
};

function makeMocks() {
  return [
    {
      request: { query: GLOBAL_STATS },
      result: { data: { globalStats: { __typename: "GlobalStats", ...globalStatsData } } },
    },
    {
      request: { query: GET_COUNTRIES, variables: { region: null, minPop: null, maxPop: null, limit: 250 } },
      result: { data: { countries: [] } },
    },
    {
      request: { query: TOP_BY_COVID, variables: { limit: 250 } },
      result: { data: { topByCovid: [] } },
    },
  ];
}

async function renderHome() {
  const store = makeStore();
  const wrapper = mount(
    <Provider store={store}>
      <MockedProvider mocks={makeMocks()}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </MockedProvider>
    </Provider>
  );
  await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
  wrapper.update();
  return wrapper;
}

describe("<Home />", () => {
  it("shows a loader before global stats have loaded", () => {
    const store = makeStore();
    const wrapper = mount(
      <Provider store={store}>
        <MockedProvider mocks={makeMocks()}>
          <MemoryRouter>
            <Home />
          </MemoryRouter>
        </MockedProvider>
      </Provider>
    );
    expect(wrapper.find(Loader)).toHaveLength(1);
  });

  it("renders the Global Overview heading", async () => {
    const wrapper = await renderHome();
    expect(wrapper.text()).toContain("Global Overview");
  });

  it("renders formatted stat cards once data loads", async () => {
    const wrapper = await renderHome();
    const text = wrapper.text();
    expect(text).toContain("195");        // countries
    expect(text).toContain("8.00B");      // world population
    expect(text).toContain("700.0M");     // covid cases
    expect(text).toContain("6.9M");       // covid deaths
  });

  it("renders the four notable-country cards", async () => {
    const wrapper = await renderHome();
    const text = wrapper.text();
    expect(text).toContain("Most Populated");
    expect(text).toContain("Least Populated");
    expect(text).toContain("Highest Density");
    expect(text).toContain("Most COVID Cases");
    expect(text).toContain("India");
    expect(text).toContain("Nauru");
    expect(text).toContain("Monaco");
  });

  it("renders the three quick-link cards", async () => {
    const wrapper = await renderHome();
    const text = wrapper.text();
    expect(text).toContain("Country Explorer");
    expect(text).toContain("Rankings & Charts");
    expect(text).toContain("Outbreak Alerts");
  });

  it("renders the world map", async () => {
    const wrapper = await renderHome();
    expect(wrapper.find("svg").exists()).toBe(true);
  });
});
