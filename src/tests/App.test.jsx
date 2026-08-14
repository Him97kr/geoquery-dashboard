import React from "react";
import { mount } from "enzyme";
import { act } from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { MockedProvider } from "@apollo/client/testing";
import App from "../App";
import { makeStore } from "../testUtils";

function renderApp(initialEntries) {
  const store = makeStore();
  return mount(
    <Provider store={store}>
      <MockedProvider mocks={[]} showWarnings={false}>
        <MemoryRouter initialEntries={initialEntries}>
          <App />
        </MemoryRouter>
      </MockedProvider>
    </Provider>
  );
}

async function flush(wrapper) {
  await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
  wrapper.update();
}

describe("<App />", () => {
  it("always renders the Navbar regardless of route", async () => {
    const wrapper = renderApp(["/explorer"]);
    await flush(wrapper);
    expect(wrapper.text()).toContain("GeoQuery Dashboard");
  });

  it("renders the Explorer page content at /explorer", async () => {
    const wrapper = renderApp(["/explorer"]);
    await flush(wrapper);
    expect(wrapper.text()).toContain("Country Explorer");
  });

  it("renders the Rankings page content at /rankings", async () => {
    const wrapper = renderApp(["/rankings"]);
    await flush(wrapper);
    expect(wrapper.text()).toContain("Rankings");
  });

  it("renders the Outbreaks page content at /outbreaks", async () => {
    const wrapper = renderApp(["/outbreaks"]);
    await flush(wrapper);
    expect(wrapper.text()).toContain("WHO Outbreak Alerts");
  });

  it("renders the CountryDetail page content at /country/:code", async () => {
    const wrapper = renderApp(["/country/IND"]);
    await flush(wrapper);
    // No GET_COUNTRY mock is registered for this test, so by the time
    // pending promises flush the query has already errored out to the
    // "not found" state — this still proves App correctly matched the
    // /country/:code route to CountryDetail.
    expect(wrapper.text()).toContain("Country not found");
    expect(wrapper.text()).toContain("code: IND");
  });
});
