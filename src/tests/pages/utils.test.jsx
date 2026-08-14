import { whoOutbreaksUrl } from "../../pages/utils";

describe("pages/utils", () => {
  it("exports the WHO outbreaks base URL", () => {
    expect(whoOutbreaksUrl).toBe("https://www.who.int/emergencies/disease-outbreak-news/item/");
  });

  it("is a valid, well-formed https URL", () => {
    expect(() => new URL(whoOutbreaksUrl)).not.toThrow();
    expect(whoOutbreaksUrl.startsWith("https://")).toBe(true);
  });

  it("concatenates cleanly with an outbreak urlName", () => {
    const full = whoOutbreaksUrl + "2024-DON123";
    expect(full).toBe("https://www.who.int/emergencies/disease-outbreak-news/item/2024-DON123");
  });
});
