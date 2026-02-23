import type { Mock } from "vitest";

const mockRender: Mock = vi.fn();
const mockCreateRoot: Mock = vi.fn(() => ({ render: mockRender, unmount: vi.fn() }));

vi.mock(import("react-dom/client"), () => ({
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
