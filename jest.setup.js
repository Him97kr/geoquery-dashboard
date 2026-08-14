import "@testing-library/jest-dom";
import Enzyme from "enzyme";
import Adapter from "@cfaester/enzyme-adapter-react-18";

Enzyme.configure({ adapter: new Adapter() });

// jsdom doesn't implement ResizeObserver — all chart components rely on it
// via useContainerWidth, so provide a no-op stub.
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// jsdom doesn't implement matchMedia — used by uiSlice's initial theme detection.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// SVG layout methods D3 relies on (getTotalLength, getBBox) aren't implemented
// in jsdom. jsdom also doesn't expose distinct SVGPathElement/SVGRectElement
// etc. subclasses — every SVG node comes back as a plain SVGElement — so the
// stubs are attached to SVGElement.prototype itself.
if (typeof SVGElement !== "undefined") {
  if (!SVGElement.prototype.getTotalLength) {
    SVGElement.prototype.getTotalLength = () => 0;
  }
  if (!SVGElement.prototype.getBBox) {
    SVGElement.prototype.getBBox = () => ({ x: 0, y: 0, width: 0, height: 0 });
  }
  if (!SVGElement.prototype.getPointAtLength) {
    SVGElement.prototype.getPointAtLength = () => ({ x: 0, y: 0 });
  }
}

// Default mock for global.fetch — individual tests override with their own data.
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ type: "Topology", objects: { countries: { type: "GeometryCollection", geometries: [] } }, arcs: [] }),
  })
);
