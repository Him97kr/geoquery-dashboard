import React from "react";
import { mount } from "enzyme";
import { act } from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { MockedProvider } from "@apollo/client/testing";
import Explorer from "../../pages/Explorer";
import { makeStore } from "../../testUtils";
import { GET_COUNTRIES, SEARCH_COUNTRIES } from "../../apollo/queries";
import CountryCard from "../../components/ui/CountryCard";
import Loader from "../../components/ui/Loader";

const country = (overrides) => ({
  __typename: "Country",
  code: "IND", name: "India", flag: "in.svg", region: "Asia",
  population: 1417000000, density: 481, area: 3287263,
  languages: ["Hindi"], currencies: ["INR"], capital: "New Delhi",
  ...overrides,
});

const allCountries = [
  country({}),
  country({ code: "BRA", name: "Brazil", region: "Americas", population: 216000000, density: 25 }),
];

function baseMocks() {
  return [
    {
      request: { query: GET_COUNTRIES, variables: { region: null, limit: 250 } },
      result: { data: { countries: allCountries } },
    },
    {
      request: { query: GET_COUNTRIES, variables: { region: "Asia", limit: 250 } },
      result: { data: { countries: [allCountries[0]] } },
    },
    {
      request: { query: SEARCH_COUNTRIES, variables: { query: "ind" } },
      result: { data: { searchCountries: [allCountries[0]] } },
    },
  ];
}

async function renderExplorer(mocks = baseMocks(), store = makeStore()) {
  const wrapper = mount(
    <Provider store={store}>
      <MockedProvider mocks={mocks}>
        <MemoryRouter>
          <Explorer />
        </MemoryRouter>
      </MockedProvider>
    </Provider>
  );
  await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
  wrapper.update();
  return wrapper;
}

describe("<Explorer />", () => {
  it("shows a loader while the initial country list is loading", () => {
    const store = makeStore();
    const wrapper = mount(
      <Provider store={store}>
        <MockedProvider mocks={baseMocks()}>
          <MemoryRouter>
            <Explorer />
          </MemoryRouter>
        </MockedProvider>
      </Provider>
    );
    expect(wrapper.find(Loader)).toHaveLength(1);
  });

  it("renders a CountryCard for every fetched country", async () => {
    const wrapper = await renderExplorer();
    expect(wrapper.find(CountryCard)).toHaveLength(2);
  });

  it("shows the correct count and 'worldwide' label with no region filter", async () => {
    const wrapper = await renderExplorer();
    expect(wrapper.text()).toContain("2 countries worldwide");
  });

  it("filters by region when a region is selected", async () => {
    const wrapper = await renderExplorer();
    act(() => {
      wrapper.find("select").simulate("change", { target: { value: "Asia" } });
    });
    await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
    wrapper.update();
    expect(wrapper.text()).toContain("1 countries in Asia");
    expect(wrapper.find(CountryCard)).toHaveLength(1);
  });

  it("switches to search results once 2+ characters are typed", async () => {
    const wrapper = await renderExplorer();
    act(() => {
      wrapper.find('input[type="text"]').simulate("change", { target: { value: "ind" } });
    });
    await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
    wrapper.update();
    expect(wrapper.find(CountryCard)).toHaveLength(1);
    expect(wrapper.text()).toContain("India");
  });

  it("resets filters when the Reset button is clicked", async () => {
    const wrapper = await renderExplorer();
    act(() => {
      wrapper.find('input[type="text"]').simulate("change", { target: { value: "ind" } });
    });
    await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
    wrapper.update();

    act(() => {
      wrapper.findWhere((n) => n.type() === "button" && n.text() === "Reset").first().simulate("click");
    });
    wrapper.update();
    expect(wrapper.find('input[type="text"]').prop("value")).toBe("");
  });

  it("shows a 'No countries found' message when the result set is empty", async () => {
    const emptyMocks = [
      {
        request: { query: GET_COUNTRIES, variables: { region: null, limit: 250 } },
        result: { data: { countries: [] } },
      },
    ];
    const wrapper = await renderExplorer(emptyMocks);
    expect(wrapper.text()).toContain("No countries found.");
  });

  it("toggles sort direction when clicking the active sort badge twice", async () => {
    const wrapper = await renderExplorer();
    const nameBadge = () => wrapper.findWhere((n) => n.type() === "button" && n.text().startsWith("Name")).first();

    act(() => { nameBadge().simulate("click"); });
    wrapper.update();
    expect(nameBadge().text()).toContain("↓");

    act(() => { nameBadge().simulate("click"); });
    wrapper.update();
    expect(nameBadge().text()).toContain("↑");
  });
});
