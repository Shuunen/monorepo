import { render, screen } from "@testing-library/react";
import { About } from "./about.tab";

describe("about", () => {
  it("About A should render successfully", () => {
    const { container } = render(<About />);
    expect(container).toBeInstanceOf(HTMLElement);
  });

  it("About B should display the purpose section", () => {
    render(<About />);
    const purposeHeading = screen.getByText("Purpose");
    expect(purposeHeading).toBeInstanceOf(HTMLElement);
  });

  it("About C should display the usage section", () => {
    render(<About />);
    const usageHeading = screen.getByText("Usage");
    expect(usageHeading).toBeInstanceOf(HTMLElement);
  });

  it("About D should display the tech stack section", () => {
    render(<About />);
    const techStackHeading = screen.getByText("Tech stack");
    expect(techStackHeading).toBeInstanceOf(HTMLElement);
  });
});
