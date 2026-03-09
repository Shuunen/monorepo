import { functionReturningVoid } from "@monorepo/utils";
import * as loggerUtils from "./logger.utils";
import { setDarkTheme } from "./theme.utils";

const infoSpy = vi.spyOn(loggerUtils.logger, "info").mockImplementation(functionReturningVoid);

describe("theme.utils", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
    infoSpy.mockClear();
  });

  it("setDarkTheme A should enable dark theme when isDark is true", () => {
    setDarkTheme(true);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("setDarkTheme B should disable dark theme when isDark is false", () => {
    document.documentElement.classList.add("dark");
    setDarkTheme(false);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("setDarkTheme C should log enabling message when isDark is true", () => {
    setDarkTheme(true);
    expect(infoSpy).toHaveBeenCalledWith("Enabling dark theme");
  });

  it("setDarkTheme D should log disabling message when isDark is false", () => {
    setDarkTheme(false);
    expect(infoSpy).toHaveBeenCalledWith("Disabling dark theme");
  });
});
