import { render, screen } from "@testing-library/react";
import type { ContestState } from "../utils/comparison.utils";
import type { ImageMetadata } from "../utils/image.utils";
import { ContestHeader } from "./contest-header";

describe("contest-header", () => {
  const mockContestState = {
    activeImages: [
      { eliminated: false, filename: "image1.jpg", id: 0, url: "url1" },
      { eliminated: false, filename: "image2.jpg", id: 1, url: "url2" },
    ],
    allImages: [
      { eliminated: false, filename: "image1.jpg", id: 0, url: "url1" },
      { eliminated: false, filename: "image2.jpg", id: 1, url: "url2" },
    ],
    currentMatch: {
      leftImage: { eliminated: false, filename: "image1.jpg", id: 0, url: "url1" },
      matchNumber: 1,
      rightImage: { eliminated: false, filename: "image2.jpg", id: 1, url: "url2" },
    },
    isComplete: false,
    matchesCompletedInRound: 0,
    matchesInRound: 1,
    round: 1,
    winner: undefined,
  } satisfies ContestState;

  it("ContestHeader A should display contest mode header", () => {
    render(<ContestHeader contestState={mockContestState} />);
    const header = screen.getByText("Round 1 - Match 1");
    expect(header).toBeTruthy();
  });

  it("ContestHeader B should display select your preferred image message", () => {
    render(<ContestHeader contestState={mockContestState} />);
    const message = screen.getByText("Select your preferred image");
    expect(message).toBeTruthy();
  });

  it("ContestHeader C should display winner header when contest is complete", () => {
    const completeState: ContestState = {
      ...mockContestState,
      currentMatch: undefined,
      isComplete: true,
      winner: { eliminated: false, filename: "winner.jpg", id: 0, url: "winner-url" },
    };
    render(<ContestHeader contestState={completeState} />);
    const header = screen.getByText("🏆 We have a winner !");
    expect(header).toBeTruthy();
  });

  it("ContestHeader D should display winner filename when contest is complete", () => {
    const completeState: ContestState = {
      ...mockContestState,
      currentMatch: undefined,
      isComplete: true,
      winner: { eliminated: false, filename: "winner.jpg", id: 0, url: "winner-url" },
    };
    const winnerMetadata: ImageMetadata = { filename: "winner.jpg", height: 1080, size: 100000, width: 1920 };
    render(
      <ContestHeader
        contestState={completeState}
        leftImageMetadata={winnerMetadata}
        rightImageMetadata={winnerMetadata}
      />,
    );
    const filenames = screen.getAllByText("winner.jpg");
    expect(filenames.length).toBeGreaterThan(0);
  });

  it("ContestHeader E should not display image info during contest mode", () => {
    render(
      <ContestHeader
        contestState={mockContestState}
        leftImageMetadata={{ filename: "image1.jpg", height: 800, size: 50000, width: 600 }}
        rightImageMetadata={{ filename: "image2.jpg", height: 800, size: 60000, width: 600 }}
      />,
    );
    const filename = screen.queryByText("image1.jpg");
    expect(filename).toBeNull();
  });

  it("ContestHeader F should not have a title when no contest state is provided", () => {
    render(
      <ContestHeader
        leftImageMetadata={{ filename: "image1.jpg", height: 800, size: 50000, width: 600 }}
        rightImageMetadata={{ filename: "image2.jpg", height: 800, size: 60000, width: 600 }}
      />,
    );
    const title = screen.queryByRole("heading");
    expect(title).toBeNull();
  });
});
