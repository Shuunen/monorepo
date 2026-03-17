import { TooltipProvider } from "@monorepo/components";
import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { App } from "./app";

describe(App, () => {
  it("should render successfully", () => {
    const { baseElement } = render(
      <BrowserRouter>
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </BrowserRouter>,
    );
    expect(baseElement).toBeTruthy();
  });

  it("should have a greeting", () => {
    const { getAllByText } = render(
      <BrowserRouter>
        <TooltipProvider>
          <App />
        </TooltipProvider>
      </BrowserRouter>,
    );
    expect(getAllByText("Logo Tester").length > 0).toBeTruthy();
  });
});
