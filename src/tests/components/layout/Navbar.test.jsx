import React from "react";
import { mount } from "enzyme";
import { Link } from "react-router-dom";
import Navbar from "../../../components/layout/Navbar";
import { AllProviders } from "../../../testUtils";

describe("<Navbar />", () => {
  it("renders the dashboard title", () => {
    const wrapper = mount(
      <AllProviders>
        <Navbar />
      </AllProviders>
    );
    expect(wrapper.text()).toContain("GeoQuery Dashboard");
  });

  it("renders a nav link for every route", () => {
    const wrapper = mount(
      <AllProviders>
        <Navbar />
      </AllProviders>
    );
    const labels = wrapper.find(Link).map((l) => l.text()).filter(Boolean);
    expect(labels).toEqual(expect.arrayContaining(["Home", "Explorer", "Rankings", "Outbreaks"]));
  });

  it("links point at the expected paths", () => {
    const wrapper = mount(
      <AllProviders>
        <Navbar />
      </AllProviders>
    );
    const hrefs = wrapper.find(Link).map((l) => l.prop("to"));
    expect(hrefs).toEqual(expect.arrayContaining(["/", "/explorer", "/rankings", "/outbreaks"]));
  });

  it("renders the ThemeToggle control", () => {
    const wrapper = mount(
      <AllProviders>
        <Navbar />
      </AllProviders>
    );
    expect(wrapper.find('button[aria-label="Toggle dark mode"]')).toHaveLength(1);
  });

  it("shows the GraphQL API status indicator", () => {
    const wrapper = mount(
      <AllProviders>
        <Navbar />
      </AllProviders>
    );
    expect(wrapper.text()).toContain("GraphQL API");
  });
});
