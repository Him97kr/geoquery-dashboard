import React from "react";
import { mount } from "enzyme";
import { act } from "react";
import CountryCard from "../../../components/ui/CountryCard";
import { AllProviders, makeStore, sampleCountry } from "../../../testUtils";
import { selectSelectedCountry } from "../../../features/countries/countriesSlice";

describe("<CountryCard />", () => {
  it("renders the country name, code, region, population and density", () => {
    const wrapper = mount(
      <AllProviders>
        <CountryCard country={sampleCountry} />
      </AllProviders>
    );
    expect(wrapper.text()).toContain("India");
    expect(wrapper.text()).toContain("IND");
    expect(wrapper.text()).toContain("Asia");
    expect(wrapper.text()).toContain("1.42B");
    expect(wrapper.text()).toContain("481.7");
  });

  it("shows N/A for density when the country has none", () => {
    const wrapper = mount(
      <AllProviders>
        <CountryCard country={{ ...sampleCountry, density: null }} />
      </AllProviders>
    );
    expect(wrapper.text()).toContain("N/A");
  });

  it("dispatches setSelectedCountry and navigates when clicked", () => {
    const store = makeStore();
    const wrapper = mount(
      <AllProviders store={store}>
        <CountryCard country={sampleCountry} />
      </AllProviders>
    );

    act(() => {
      wrapper.find("button").simulate("click");
    });

    expect(selectSelectedCountry(store.getState())).toEqual(sampleCountry);
  });

  it("renders the flag image with correct src and alt", () => {
    const wrapper = mount(
      <AllProviders>
        <CountryCard country={sampleCountry} />
      </AllProviders>
    );
    const img = wrapper.find("img");
    expect(img.prop("src")).toBe(sampleCountry.flag);
    expect(img.prop("alt")).toBe(sampleCountry.name);
  });

  it.each([
    [999, "999"],
    [1500, "1.5K"],
    [2500000, "2.5M"],
    [3200000000, "3.20B"],
  ])("formats population %d as %s", (population, expected) => {
    const wrapper = mount(
      <AllProviders>
        <CountryCard country={{ ...sampleCountry, population }} />
      </AllProviders>
    );
    expect(wrapper.text()).toContain(expected);
  });
});
