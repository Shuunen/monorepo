import { mockItem } from "../utils/mock.utils";
import { findItemById, handlePrintAction } from "./page-item-print.utils";

vi.mock(import("@monorepo/utils"), async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    sleep: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock(import("../utils/browser.utils"), () => ({
  clearElementsForPrint: vi.fn(),
}));

vi.mock(import("../utils/item.utils"), () => ({
  updateItem: vi.fn(),
}));

describe("page-item-print.utils", () => {
  beforeEach(async () => {
    const { state } = await import("../utils/state.utils");
    vi.clearAllMocks();
    state.items = [];
    globalThis.print = vi.fn();
  });

  it("findItemById A should return matching item", async () => {
    const { state } = await import("../utils/state.utils");
    const item = mockItem({ $id: "item-a" });
    state.items = [item];
    expect(findItemById("item-a")).toStrictEqual(item);
  });

  it("findItemById B should throw when item does not exist", async () => {
    const { state } = await import("../utils/state.utils");
    state.items = [];
    expect(() => findItemById("missing")).toThrow('Item with id "missing" not found ;(');
  });

  it("handlePrintAction A should mark item as printed and show success", async () => {
    const { clearElementsForPrint } = await import("../utils/browser.utils");
    const { updateItem } = await import("../utils/item.utils");
    const { logger } = await import("../utils/logger.utils");
    const showSuccess = vi.spyOn(logger, "showSuccess").mockImplementation(() => undefined);
    const showError = vi.spyOn(logger, "showError").mockImplementation(() => undefined);
    const error = vi.spyOn(logger, "error").mockImplementation(() => undefined);
    vi.mocked(updateItem).mockResolvedValue({ ok: true, value: mockItem() });
    const item = mockItem({ isPrinted: false });
    const setIsPrintMode = vi.fn<(value: boolean) => void>();
    await handlePrintAction(item, setIsPrintMode);
    expect(vi.mocked(clearElementsForPrint)).toHaveBeenCalledOnce();
    expect(globalThis.print).toHaveBeenCalledOnce();
    expect(setIsPrintMode).toHaveBeenNthCalledWith(1, true);
    expect(setIsPrintMode).toHaveBeenNthCalledWith(2, false);
    expect(item.isPrinted).toBe(true);
    expect(vi.mocked(updateItem)).toHaveBeenCalledWith(item);
    expect(showSuccess).toHaveBeenCalledWith("updated item as printed");
    expect(showError).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("handlePrintAction B should skip update when item is already printed", async () => {
    const { updateItem } = await import("../utils/item.utils");
    const item = mockItem({ isPrinted: true });
    const setIsPrintMode = vi.fn<(value: boolean) => void>();
    await handlePrintAction(item, setIsPrintMode);
    expect(vi.mocked(updateItem)).not.toHaveBeenCalled();
    expect(setIsPrintMode).toHaveBeenNthCalledWith(1, true);
    expect(setIsPrintMode).toHaveBeenNthCalledWith(2, false);
  });

  it("handlePrintAction C should log errors when update fails", async () => {
    const { updateItem } = await import("../utils/item.utils");
    const { logger } = await import("../utils/logger.utils");
    const showError = vi.spyOn(logger, "showError").mockImplementation(() => undefined);
    const error = vi.spyOn(logger, "error").mockImplementation(() => undefined);
    vi.mocked(updateItem).mockResolvedValue({ ok: false, error: "boom" });
    const item = mockItem({ isPrinted: false });
    const setIsPrintMode = vi.fn<(value: boolean) => void>();
    await handlePrintAction(item, setIsPrintMode);
    expect(showError).toHaveBeenCalledWith("failed updating item as printed");
    expect(error).toHaveBeenCalledWith("pushItem failed", { ok: false, error: "boom" });
  });
});
