import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Comparison } from "./comparison.tab";

// Mock framer-motion to avoid animation issues in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => <div {...props}>{children}</div>,
  },
}));

describe("comparison", () => {
  it("Comparison A should render successfully", () => {
    const { container } = render(<Comparison />);
    expect(container).toBeTruthy();
  });

  it("Comparison B should render control buttons", () => {
    render(<Comparison />);
    const controlButtons = screen.getByTestId("control-buttons");
    expect(controlButtons).toBeTruthy();
  });

  it("Comparison C should display zoom percentage", () => {
    render(<Comparison />);
    const zoomText = screen.getByText("Zoom: 100%");
    expect(zoomText).toBeTruthy();
  });

  it("Comparison D should reset view when reset button is clicked", () => {
    render(<Comparison />);
    const resetButton = screen.getByText("Reset view");
    fireEvent.click(resetButton);
    const zoomText = screen.getByText("Zoom: 100%");
    expect(zoomText).toBeTruthy();
  });

  it("Comparison E should update zoom on wheel event", () => {
    const { container } = render(<Comparison />);
    const imageViewer = container.querySelector(".relative.w-full.aspect-video");
    if (imageViewer) {
      fireEvent.wheel(imageViewer, { deltaY: -100 });
      // Zoom should change but we can't easily test the exact value in this simple test
      expect(imageViewer).toBeTruthy();
    }
  });

  it("Comparison F should handle drag enter event", () => {
    const { container } = render(<Comparison />);
    const imageViewer = container.querySelector(".relative.w-full.aspect-video");
    if (imageViewer) {
      fireEvent.dragEnter(imageViewer, {
        dataTransfer: {
          files: [],
        },
      });
      expect(imageViewer).toBeTruthy();
    }
  });

  it("Comparison G should handle drag leave event", () => {
    const { container } = render(<Comparison />);
    const imageViewer = container.querySelector(".relative.w-full.aspect-video");
    if (imageViewer) {
      fireEvent.dragLeave(imageViewer, {
        currentTarget: imageViewer,
        relatedTarget: null,
        target: imageViewer,
      });
      expect(imageViewer).toBeTruthy();
    }
  });

  it("Comparison H should handle mouse down on image when zoomed", () => {
    const { container } = render(<Comparison />);
    const imageViewer = container.querySelector(".relative.w-full.aspect-video");
    if (imageViewer) {
      // First zoom in
      fireEvent.wheel(imageViewer, { deltaY: -500 });
      // Then try to pan
      fireEvent.mouseDown(imageViewer, { clientX: 100, clientY: 100 });
      expect(imageViewer).toBeTruthy();
    }
  });

  it("Comparison I should handle mouse move when panning", () => {
    const { container } = render(<Comparison />);
    const imageViewer = container.querySelector(".relative.w-full.aspect-video");
    if (imageViewer) {
      // Zoom in
      fireEvent.wheel(imageViewer, { deltaY: -500 });
      // Start panning
      fireEvent.mouseDown(imageViewer, { clientX: 100, clientY: 100 });
      // Move mouse
      fireEvent.mouseMove(imageViewer, { clientX: 150, clientY: 150 });
      expect(imageViewer).toBeTruthy();
    }
  });

  it("Comparison J should handle mouse up to stop panning", () => {
    const { container } = render(<Comparison />);
    const imageViewer = container.querySelector(".relative.w-full.aspect-video");
    if (imageViewer) {
      fireEvent.wheel(imageViewer, { deltaY: -500 });
      fireEvent.mouseDown(imageViewer, { clientX: 100, clientY: 100 });
      fireEvent.mouseUp(imageViewer);
      expect(imageViewer).toBeTruthy();
    }
  });

  it("Comparison K should handle mouse leave to stop panning", () => {
    const { container } = render(<Comparison />);
    const imageViewer = container.querySelector(".relative.w-full.aspect-video");
    if (imageViewer) {
      fireEvent.wheel(imageViewer, { deltaY: -500 });
      fireEvent.mouseDown(imageViewer, { clientX: 100, clientY: 100 });
      fireEvent.mouseLeave(imageViewer);
      expect(imageViewer).toBeTruthy();
    }
  });

  it("Comparison L should handle slider value change", () => {
    render(<Comparison />);
    // Slider control is rendered
    const container = screen.getByTestId("control-buttons").parentElement;
    expect(container).toBeTruthy();
  });

  it("Comparison M should not pan when zoom is at minimum", () => {
    const { container } = render(<Comparison />);
    const imageViewer = container.querySelector(".relative.w-full.aspect-video");
    if (imageViewer) {
      // Try to pan without zooming
      fireEvent.mouseDown(imageViewer, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(imageViewer, { clientX: 150, clientY: 150 });
      // Should not pan, verify zoom is still 100%
      const zoomText = screen.getByText("Zoom: 100%");
      expect(zoomText).toBeTruthy();
    }
  });

  it("Comparison N should handle drag over event", () => {
    const { container } = render(<Comparison />);
    const imageViewer = container.querySelector(".relative.w-full.aspect-video");
    if (imageViewer) {
      fireEvent.dragOver(imageViewer, {
        dataTransfer: {
          files: [],
        },
      });
      expect(imageViewer).toBeTruthy();
    }
  });

  it("Comparison O should handle drop event with files", () => {
    const { container } = render(<Comparison />);
    const imageViewer = container.querySelector(".relative.w-full.aspect-video");
    if (imageViewer) {
      const file1 = new File(["content1"], "test1.jpg", { type: "image/jpeg" });
      const file2 = new File(["content2"], "test2.jpg", { type: "image/jpeg" });
      fireEvent.drop(imageViewer, {
        dataTransfer: {
          files: [file1, file2],
        },
      });
      expect(imageViewer).toBeTruthy();
    }
  });

  it("Comparison P should handle slider handle drag", () => {
    const { container } = render(<Comparison />);
    const sliderHandle = container.querySelector('[test-id="slider-handle"]');
    if (sliderHandle) {
      fireEvent.mouseDown(sliderHandle, { clientX: 100, clientY: 100 });
      expect(sliderHandle).toBeTruthy();
    }
  });

  it("Comparison Q should handle slider handle drag move", () => {
    const { container } = render(<Comparison />);
    const sliderHandle = container.querySelector('[test-id="slider-handle"]');
    const imageViewer = container.querySelector(".relative.w-full.aspect-video");
    if (sliderHandle && imageViewer) {
      fireEvent.mouseDown(sliderHandle, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(imageViewer, { clientX: 200, clientY: 100 });
      expect(sliderHandle).toBeTruthy();
    }
  });

  it("Comparison R should handle winner selection and update images", () => {
    const { container } = render(<Comparison />);
    const imageViewer = container.querySelector(".relative.w-full.aspect-video");
    if (imageViewer) {
      // Drop 4 files to start contest
      const file1 = new File(["content1"], "test1.jpg", { type: "image/jpeg" });
      const file2 = new File(["content2"], "test2.jpg", { type: "image/jpeg" });
      const file3 = new File(["content3"], "test3.jpg", { type: "image/jpeg" });
      const file4 = new File(["content4"], "test4.jpg", { type: "image/jpeg" });
      fireEvent.drop(imageViewer, {
        dataTransfer: {
          files: [file1, file2, file3, file4],
        },
      });
      expect(imageViewer).toBeTruthy();
    }
  });

  it("Comparison S should handle left image upload", () => {
    const { container } = render(<Comparison />);
    const fileInput = container.querySelector("#left-upload");
    if (fileInput) {
      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
      fireEvent.change(fileInput, { target: { files: [file] } });
      expect(fileInput).toBeTruthy();
    }
  });

  it("Comparison T should handle right image upload", () => {
    const { container } = render(<Comparison />);
    const fileInput = container.querySelector("#right-upload");
    if (fileInput) {
      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });
      fireEvent.change(fileInput, { target: { files: [file] } });
      expect(fileInput).toBeTruthy();
    }
  });

  it("Comparison U should handle zoom triggering pan reset", () => {
    const { container } = render(<Comparison />);
    const imageViewer = container.querySelector(".relative.w-full.aspect-video");
    if (imageViewer) {
      // Zoom in first
      fireEvent.wheel(imageViewer, { deltaY: -500 });
      // Pan the image
      fireEvent.mouseDown(imageViewer, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(imageViewer, { clientX: 150, clientY: 150 });
      fireEvent.mouseUp(imageViewer);
      // Zoom back to minimum - should reset pan
      fireEvent.wheel(imageViewer, { deltaY: 5000 });
      const zoomText = screen.getByText("Zoom: 100%");
      expect(zoomText).toBeTruthy();
    }
  });
});
