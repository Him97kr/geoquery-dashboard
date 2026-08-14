import React from "react";
import { mount } from "enzyme";
import { act } from "react";
import { Provider } from "react-redux";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { MockedProvider } from "@apollo/client/testing";
import CountryDetail from "../../pages/CountryDetail";
import { makeStore } from "../../testUtils";
import { GET_COUNTRY } from "../../apollo/queries";
import { selectSelectedCountry } from "../../features/countries/countriesSlice";

const fullCountry = {
  __typename: "Country",
  name: "India", code: "IND", flag: "in.svg", region: "Asia",
  population: 1417173173, density: 481.7, area: 3287263,
  languages: ["Hindi", "English"], currencies: ["INR"], capital: "New Delhi",
  covid: {
    __typename: "CovidStats",
    cases: 45000000, todayCases: 1200, deaths: 530000, todayDeaths: 10,
    recovered: 44000000, active: 470000, critical: 500,
    casesPerMillion: 32000, deathsPerMillion: 380, updatedAt: "2024-06-01T00:00:00Z",
  },
  outbreaks: [
    { __typename: "Outbreak", title: "Localized dengue cluster", date: "2024-04-01", urlName: "2024-DON999", summary: "Small cluster reported in southern state." },
  ],
};

function renderDetail(code = "IND", mocks) {
  const store = makeStore();
  const resolvedMocks = mocks || [
    {
      request: { query: GET_COUNTRY, variables: { code, name: null } },
      result: { data: { country: fullCountry } },
    },
  ];
  const wrapper = mount(
    <Provider store={store}>
      <MockedProvider mocks={resolvedMocks}>
        <MemoryRouter initialEntries={[`/country/${code}`]}>
          <Routes>
            <Route path="/country/:code" element={<CountryDetail />} />
            <Route path="/explorer" element={<div>Explorer Page</div>} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    </Provider>
  );
  return { wrapper, store };
}

async function flush(wrapper) {
  await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
  wrapper.update();
}

describe("<CountryDetail />", () => {
  it("shows a loading state while the query is in flight", () => {
    const { wrapper } = renderDetail();
    expect(wrapper.text()).toContain("Loading IND...");
  });

  it("renders the country name, code, capital and region once loaded", async () => {
    const { wrapper } = renderDetail();
    await flush(wrapper);
    expect(wrapper.text()).toContain("India");
    expect(wrapper.text()).toContain("IND · New Delhi · Asia");
  });

  it("renders demographic stat cards", async () => {
    const { wrapper } = renderDetail();
    await flush(wrapper);
    const text = wrapper.text();
    expect(text).toContain("1.42B");     // population
    expect(text).toContain("481.7 /km²"); // density
    expect(text).toContain("3.3M km²");   // area
  });

  it("renders languages and currencies", async () => {
    const { wrapper } = renderDetail();
    await flush(wrapper);
    const text = wrapper.text();
    expect(text).toContain("Hindi");
    expect(text).toContain("English");
    expect(text).toContain("INR");
  });

  it("renders COVID stats when present", async () => {
    const { wrapper } = renderDetail();
    await flush(wrapper);
    const text = wrapper.text();
    expect(text).toContain("COVID-19 · disease.sh");
    expect(text).toContain("45.0M"); // total cases
  });

  it("renders WHO outbreak alerts with a working link", async () => {
    const { wrapper } = renderDetail();
    await flush(wrapper);
    expect(wrapper.text()).toContain("Localized dengue cluster");
    const link = wrapper.findWhere((n) => n.type() === "a" && n.prop("href")?.includes("2024-DON999")).first();
    expect(link.exists()).toBe(true);
  });

  it("shows a 'no active alerts' message when there are none", async () => {
    const mocks = [{
      request: { query: GET_COUNTRY, variables: { code: "IND", name: null } },
      result: { data: { country: { ...fullCountry, outbreaks: [] } } },
    }];
    const { wrapper } = renderDetail("IND", mocks);
    await flush(wrapper);
    expect(wrapper.text()).toContain("No active WHO alerts for India");
  });

  it("dispatches setSelectedCountry into Redux once loaded", async () => {
    const { wrapper, store } = renderDetail();
    await flush(wrapper);
    expect(selectSelectedCountry(store.getState())).toEqual(fullCountry);
  });

  it("shows a 'Country not found' state on error", async () => {
    const mocks = [{
      request: { query: GET_COUNTRY, variables: { code: "ZZZ", name: null } },
      error: new Error("Not found"),
    }];
    const { wrapper } = renderDetail("ZZZ", mocks);
    await flush(wrapper);
    expect(wrapper.text()).toContain("Country not found");
  });

  it("navigates back to Explorer from the not-found state", async () => {
    const mocks = [{
      request: { query: GET_COUNTRY, variables: { code: "ZZZ", name: null } },
      error: new Error("Not found"),
    }];
    const { wrapper } = renderDetail("ZZZ", mocks);
    await flush(wrapper);
    act(() => {
      wrapper.findWhere((n) => n.type() === "button" && n.text() === "Back to Explorer").first().simulate("click");
    });
    wrapper.update();
    expect(wrapper.text()).toContain("Explorer Page");
  });
});
