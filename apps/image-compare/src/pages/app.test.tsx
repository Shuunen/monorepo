import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { App } from "./app.page";

describe(App, () => {
  it("should render successfully", () => {
    const { baseElement } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );
    expect(baseElement).toBeInstanceOf(HTMLElement);
  });

  it("should have a greeting", () => {
    const { getAllByText } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );
    expect(getAllByText("Image Compare").length > 0).toBe(true);
  });
});
