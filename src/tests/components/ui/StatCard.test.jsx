import React from "react";
import { shallow } from "enzyme";
import { Globe2 } from "lucide-react";
import StatCard from "../../../components/ui/StatCard";

describe("<StatCard />", () => {
  it("renders the label and value", () => {
    const wrapper = shallow(<StatCard label="Countries" value="195" />);
    expect(wrapper.find(".stat-label").text()).toBe("Countries");
    expect(wrapper.find(".font-mono.font-bold").text()).toBe("195");
  });

  it("renders the sub text when provided", () => {
    const wrapper = shallow(<StatCard label="Population" value="1.4B" sub="as of today" />);
    expect(wrapper.find(".text-muted").text()).toBe("as of today");
  });

  it("omits sub text when not provided", () => {
    const wrapper = shallow(<StatCard label="Population" value="1.4B" />);
    expect(wrapper.find(".text-muted")).toHaveLength(0);
  });

  it("renders the icon when provided", () => {
    const wrapper = shallow(<StatCard label="Countries" value="195" icon={Globe2} />);
    expect(wrapper.find(Globe2)).toHaveLength(1);
  });

  it("omits the icon slot when no icon prop given", () => {
    const wrapper = shallow(<StatCard label="Countries" value="195" />);
    expect(wrapper.find(Globe2)).toHaveLength(0);
  });

  it.each(["teal", "lav", "red", "yellow"])("applies the %s accent classes", (accent) => {
    const wrapper = shallow(<StatCard label="X" value="1" accent={accent} icon={Globe2} />);
    const valueClass = {
      teal: "text-teal", lav: "text-lav", red: "text-red-400", yellow: "text-yellow-400",
    }[accent];
    expect(wrapper.find(`.${valueClass}`).exists()).toBe(true);
  });

  it("falls back to the teal accent for an unrecognized accent value", () => {
    const wrapper = shallow(<StatCard label="X" value="1" accent="not-a-real-accent" />);
    expect(wrapper.find(".text-teal").exists()).toBe(true);
  });
});
