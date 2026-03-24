import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { App } from "./app";

describe(App, () => {
  it("should render successfully", () => {
    const { baseElement } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );
    expect(baseElement).toBeDefined();
  });

  it("should have a greeting", () => {
    const { getAllByText } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );
    expect(getAllByText("sample-web-app").length > 0).toBe(true);
  });
});
