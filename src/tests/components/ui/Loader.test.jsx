import React from "react";
import { shallow } from "enzyme";
import Loader from "../../../components/ui/Loader";

describe("<Loader />", () => {
  it("renders the default loading text when no prop is given", () => {
    const wrapper = shallow(<Loader />);
    expect(wrapper.find("p").text()).toBe("Loading...");
  });

  it("renders custom text when provided", () => {
    const wrapper = shallow(<Loader text="Fetching countries..." />);
    expect(wrapper.find("p").text()).toBe("Fetching countries...");
  });

  it("renders a single spinner element", () => {
    const wrapper = shallow(<Loader />);
    expect(wrapper.find(".animate-spin")).toHaveLength(1);
  });
});
