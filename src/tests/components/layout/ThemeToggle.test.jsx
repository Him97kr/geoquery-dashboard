import React from "react";
import { mount } from "enzyme";
import { act } from "react";
import { Provider } from "react-redux";
import ThemeToggle from "../../../components/layout/ThemeToggle";
import { makeStore } from "../../../testUtils";
import { setTheme, selectTheme } from "../../../features/ui/uiSlice";

describe("<ThemeToggle />", () => {
  it("shows 'Switch to light mode' title when currently dark", () => {
    const store = makeStore();
    store.dispatch(setTheme("dark"));
    const wrapper = mount(
      <Provider store={store}>
        <ThemeToggle />
      </Provider>
    );
    expect(wrapper.find("button").prop("title")).toBe("Switch to light mode");
  });

  it("shows 'Switch to dark mode' title when currently light", () => {
    const store = makeStore();
    store.dispatch(setTheme("light"));
    const wrapper = mount(
      <Provider store={store}>
        <ThemeToggle />
      </Provider>
    );
    expect(wrapper.find("button").prop("title")).toBe("Switch to dark mode");
  });

  it("dispatches toggleTheme on click, flipping the stored theme", () => {
    const store = makeStore();
    store.dispatch(setTheme("dark"));
    const wrapper = mount(
      <Provider store={store}>
        <ThemeToggle />
      </Provider>
    );

    act(() => {
      wrapper.find("button").simulate("click");
    });

    expect(selectTheme(store.getState())).toBe("light");
  });

  it("has an accessible aria-label", () => {
    const store = makeStore();
    const wrapper = mount(
      <Provider store={store}>
        <ThemeToggle />
      </Provider>
    );
    expect(wrapper.find("button").prop("aria-label")).toBe("Toggle dark mode");
  });
});
