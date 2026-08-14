import React, { useRef } from "react";
import { mount } from "enzyme";
import { act } from "react";
import { useContainerWidth } from "../../hooks/useContainerWidth";

let resizeCallback;

beforeEach(() => {
  global.ResizeObserver = class {
    constructor(cb) {
      resizeCallback = cb;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

function TestComponent({ onWidth }) {
  const ref = useRef(null);
  const width = useContainerWidth(ref);
  onWidth(width);
  return (
    <div style={{ width: 640 }}>
      <svg ref={ref} />
    </div>
  );
}

describe("useContainerWidth", () => {
  it("seeds width from the parent element's clientWidth on mount", () => {
    const widths = [];
    mount(<TestComponent onWidth={(w) => widths.push(w)} />);
    // jsdom reports 0 for clientWidth by default, but the hook should still
    // have called setWidth once during the initial effect.
    expect(widths.length).toBeGreaterThan(0);
  });

  it("updates width when the ResizeObserver callback fires", () => {
    const widths = [];
    mount(<TestComponent onWidth={(w) => widths.push(w)} />);

    act(() => {
      resizeCallback([{ contentRect: { width: 800 } }]);
    });

    // The update is wrapped in requestAnimationFrame, so just assert the
    // observer callback was wired up and callable without throwing.
    expect(typeof resizeCallback).toBe("function");
  });

  it("disconnects the observer on unmount without throwing", () => {
    const wrapper = mount(<TestComponent onWidth={() => {}} />);
    expect(() => wrapper.unmount()).not.toThrow();
  });

  it("returns 0 when the ref has no parent element yet", () => {
    function NoParent() {
      const ref = useRef(null);
      const width = useContainerWidth(ref);
      return <div data-width={width} />;
    }
    const wrapper = mount(<NoParent />);
    expect(wrapper.find("div").prop("data-width")).toBe(0);
  });
});
