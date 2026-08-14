import React from "react";
import { mount } from "enzyme";
import { act } from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { MockedProvider } from "@apollo/client/testing";
import Outbreaks from "../../pages/Outbreaks";
import { makeStore } from "../../testUtils";
import { COUNTRIES_WITH_OUTBREAKS, GET_COUNTRIES, TOP_BY_COVID } from "../../apollo/queries";
import Loader from "../../components/ui/Loader";

const outbreakCountries = [
  {
    __typename: "Country",
    code: "COD", name: "DR Congo", flag: "cd.svg", region: "Africa", population: 95000000,
    outbreaks: [
      { __typename: "Outbreak", title: "Ebola virus disease", date: "2024-03-01", urlName: "2024-DON123" },
      { __typename: "Outbreak", title: "Mpox", date: "2024-05-15", urlName: "2024-DON456" },
    ],
  },
];

function mocks(outbreaks = outbreakCountries) {
  return [
    { request: { query: COUNTRIES_WITH_OUTBREAKS }, result: { data: { countriesWithOutbreaks: outbreaks } } },
    { request: { query: GET_COUNTRIES, variables: { region: null, minPop: null, maxPop: null, limit: 250 } }, result: { data: { countries: [] } } },
    { request: { query: TOP_BY_COVID, variables: { limit: 250 } }, result: { data: { topByCovid: [] } } },
  ];
}

async function renderOutbreaks(outbreaks = outbreakCountries, store = makeStore()) {
  const wrapper = mount(
    <Provider store={store}>
      <MockedProvider mocks={mocks(outbreaks)}>
        <MemoryRouter>
          <Outbreaks />
        </MemoryRouter>
      </MockedProvider>
    </Provider>
  );
  await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
  wrapper.update();
  return wrapper;
}

describe("<Outbreaks />", () => {
  it("shows a loader before outbreak data has loaded", () => {
    const store = makeStore();
    const wrapper = mount(
      <Provider store={store}>
        <MockedProvider mocks={mocks()}>
          <MemoryRouter>
            <Outbreaks />
          </MemoryRouter>
        </MockedProvider>
      </Provider>
    );
    expect(wrapper.find(Loader)).toHaveLength(1);
  });

  it("renders the affected-country count in the header", async () => {
    const wrapper = await renderOutbreaks();
    expect(wrapper.text()).toContain("1 countries affected");
  });

  it("renders an alert card per affected country with its outbreak count badge", async () => {
    const wrapper = await renderOutbreaks();
    expect(wrapper.text()).toContain("DR Congo");
    expect(wrapper.text()).toContain("2 alerts");
  });

  it("renders each individual outbreak entry with a working WHO link", async () => {
    const wrapper = await renderOutbreaks();
    expect(wrapper.text()).toContain("Ebola virus disease");
    expect(wrapper.text()).toContain("Mpox");
    const link = wrapper.findWhere((n) => n.type() === "a" && n.prop("href")?.includes("2024-DON123")).first();
    expect(link.prop("href")).toBe("https://www.who.int/emergencies/disease-outbreak-news/item/2024-DON123");
    expect(link.prop("target")).toBe("_blank");
  });

  it("shows a 'no active alerts' message when there are no outbreaks", async () => {
    const wrapper = await renderOutbreaks([]);
    expect(wrapper.text()).toContain("No active WHO outbreak alerts");
    expect(wrapper.text()).toContain("0 countries affected");
  });

  it("renders the world map", async () => {
    const wrapper = await renderOutbreaks();
    expect(wrapper.find("svg").exists()).toBe(true);
  });
});
