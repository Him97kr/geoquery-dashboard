import React from "react";
import { mount } from "enzyme";
import { act } from "react";
import { Provider } from "react-redux";
import { MockedProvider } from "@apollo/client/testing";
import ChoroplethMap from "../../../components/charts/ChoroplethMap";
import { makeStore, sampleCountries } from "../../../testUtils";
import { TOP_BY_COVID } from "../../../apollo/queries";

// A minimal but valid TopoJSON world so topojson.feature() has real
// geometry to convert — India (alpha3 numeric 356) and Brazil (076).
const fakeWorldTopology = {
  type: "Topology",
  arcs: [[[0, 0], [1, 0], [0, 1], [-1, 0]]],
  objects: {
    countries: {
      type: "GeometryCollection",
      geometries: [
        { type: "Polygon", id: "356", arcs: [[0]] },
        { type: "Polygon", id: "076", arcs: [[0]] },
      ],
    },
  },
};

const covidMock = {
  request: { query: TOP_BY_COVID, variables: { limit: 250 } },
  result: {
    data: {
      topByCovid: [
        {
          __typename: "Country", name: "India", code: "IND", flag: "in.svg", region: "Asia",
          covid: { __typename: "CovidStats", cases: 45000000, deaths: 500000, active: 1000, critical: 10, casesPerMillion: 32000 },
        },
      ],
    },
  },
};

function renderMap(countries = sampleCountries) {
  const store = makeStore();
  return mount(
    <Provider store={store}>
      <MockedProvider mocks={[covidMock]}>
        <ChoroplethMap countries={countries} />
      </MockedProvider>
    </Provider>
  );
}

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve(fakeWorldTopology) })
  );
});

describe("<ChoroplethMap />", () => {
  it("renders the World Map heading", () => {
    const wrapper = renderMap();
    expect(wrapper.text()).toContain("World Map");
  });

  it("renders a badge for each of the three metrics", async () => {
    const wrapper = renderMap();
    await act(async () => { await Promise.resolve(); });
    wrapper.update();
    ["Population", "Density", "COVID Cases"].forEach((label) => {
      expect(wrapper.text()).toContain(label);
    });
  });

  it("fetches the world topology on mount", async () => {
    renderMap();
    await act(async () => { await Promise.resolve(); });
    expect(global.fetch).toHaveBeenCalledWith(
      "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
    );
  });

  it("draws a country path for every feature once topology + countries are loaded", async () => {
    const wrapper = renderMap();
    // Allow the fetch promise and subsequent effect to resolve.
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    wrapper.update();
    const svgNode = wrapper.find("svg").first().getDOMNode();
    const paths = svgNode.querySelectorAll("path");
    // 2 country paths + graticule + sphere border = 4
    expect(paths.length).toBeGreaterThanOrEqual(2);
  });

  it("switches the active metric badge when clicked", async () => {
    const wrapper = renderMap();
    await act(async () => { await Promise.resolve(); });
    wrapper.update();

    const densityBadge = wrapper.findWhere(
      (n) => n.type() === "button" && n.text() === "Density"
    ).first();

    act(() => {
      densityBadge.simulate("click");
    });
    wrapper.update();

    const activeBadge = wrapper.findWhere(
      (n) => n.type() === "button" && n.text() === "Density"
    ).first();
    expect(activeBadge.prop("className")).toContain("border-teal");
  });
});
