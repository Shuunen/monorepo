import { vi } from "vitest";

// Mock fetch to prevent network calls during tests
globalThis.fetch = vi.fn(() =>
  Promise.resolve({
    blob: () => Promise.resolve(new Blob(["mock-image-data"], { type: "image/png" })),
    json: () => Promise.resolve({}),
    ok: true,
    status: 200,
    text: () => Promise.resolve(""),
  } as Response),
);

// Mock Image loading to prevent actual image loads
const mockCreateElement = globalThis.document.createElement.bind(globalThis.document);
function dispatchLoadEvent(image: HTMLImageElement): void {
  const loadEvent = new Event("load");
  image.dispatchEvent(loadEvent);
}
function scheduleLoadEvent(image: HTMLImageElement): void {
  setTimeout(() => dispatchLoadEvent(image), 0);
}
globalThis.document.createElement = vi.fn((tagName: string) => {
  if (tagName === "img") {
    const img = mockCreateElement(tagName) as HTMLImageElement;
    // Immediately trigger load event when src is set
    Object.defineProperty(img, "src", {
      get() {
        return img.getAttribute("src") ?? "";
      },
      set(value: string) {
        img.setAttribute("src", value);
        // Set natural dimensions
        Object.defineProperty(img, "naturalWidth", { value: 1920, writable: true });
        Object.defineProperty(img, "naturalHeight", { value: 1080, writable: true });
        // Trigger load event asynchronously
        scheduleLoadEvent(img);
      },
    });
    return img;
  }
  return mockCreateElement(tagName);
});
