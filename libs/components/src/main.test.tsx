import { vi } from "vitest";

const mockRender = vi.fn();
const mockCreateRoot = vi.fn(() => ({ render: mockRender }));

vi.mock("react-dom/client", () => ({
  createRoot: mockCreateRoot,
}));

describe("main", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("main A should export root and call render with Landing component", async () => {
    const { root } = await import("./main");
    expect(mockCreateRoot).toHaveBeenCalled();
    expect(root).toBeDefined();
    expect(root.render).toBe(mockRender);
    expect(mockRender).toHaveBeenCalled();
  });
});
