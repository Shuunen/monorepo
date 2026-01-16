import { consoleLog } from "@monorepo/utils";
import { render, screen } from "@testing-library/react";
import { ImageInfos } from "./image-infos";

describe("image-infos", () => {
  it("ImageInfos A empty infos means no paragraphs are rendered", () => {
    render(<ImageInfos infos={[]} />);
    consoleLog(screen.debug());
    const paragraph = screen.queryByRole("paragraph", { hidden: true });
    expect(paragraph).toBeNull();
  });

  it("ImageInfos B should render infos for provided metadata", () => {
    const leftImageMetadata = { filename: "left.jpg", height: 600, size: 2048, width: 800 };
    const rightImageMetadata = { filename: "right.png", height: 1768, size: 4239680, width: 4024 };
    render(<ImageInfos infos={[leftImageMetadata, rightImageMetadata]} />);
    const leftName = screen.getByText("left.jpg");
    expect(leftName).toBeTruthy();
    const rightName = screen.getByText("right.png");
    expect(rightName).toBeTruthy();
    const leftSize = screen.getByText("2.00 KB");
    expect(leftSize).toBeTruthy();
    const rightSize = screen.getByText("4.04 MB");
    expect(rightSize).toBeTruthy();
    const leftResolution = screen.getByText("800 × 600");
    expect(leftResolution).toBeTruthy();
    const rightResolution = screen.getByText("4024 × 1768");
    expect(rightResolution).toBeTruthy();
  });
});
