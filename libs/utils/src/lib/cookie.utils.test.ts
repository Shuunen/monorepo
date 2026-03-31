import { GlobalRegistrator } from "@happy-dom/global-registrator";
// oxlint-disable typescript/unbound-method
// oxlint-disable unicorn/no-document-cookie - we want to create the cookies manually
import { getCookieValueByName } from "./cookie.utils.js";

if (!GlobalRegistrator.isRegistered) {
  GlobalRegistrator.register();
}

// Mock unused CookieStore common methods to comply with typing
const cookieStoreCommonMock = {
  onchange: vi.fn(),
  delete: vi.fn(),
  getAll: vi.fn(),
  set: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
};

// We need this helper function to clear all cookies before each test and ensure isolation
function clearAllCookies() {
  const allCookiesString = globalThis.document.cookie;
  if (!allCookiesString) {
    return;
  }
  const separateCookies = allCookiesString.split(";");
  for (let singleCookie of separateCookies) {
    if (!singleCookie) {
      continue;
    }
    singleCookie = singleCookie.trim();
    const position = singleCookie.indexOf("=");
    let cookieName = "";
    if (position !== -1) {
      cookieName = singleCookie.slice(0, position).trim();
    } else {
      cookieName = singleCookie;
    }
    globalThis.document.cookie = `${cookieName}=; expires=${new Date(0).toUTCString()}; path=/;`;
  }
}

describe("cookie.utils.test getCookieValueByName", () => {
  const mockCookieName = "test_cookie";
  const notMockCookieName = "not_test_cookie";
  const stringMockCookieValue = "foobar2025";
  const encodedMockCookieValue = "foobar%202025";
  const decodedMockCookieValue = "foobar 2025";
  const cookiePath = "path=/";

  beforeEach(() => {
    Reflect.deleteProperty(globalThis, "cookieStore");
    clearAllCookies();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return string value from cookieStore when available", async () => {
    const mockCookie = { name: mockCookieName, value: stringMockCookieValue };
    // Mock cookieStore
    globalThis.cookieStore = {
      ...cookieStoreCommonMock,
      get: vi.fn().mockResolvedValue(mockCookie),
    };
    const result = await getCookieValueByName(mockCookieName);
    expect(result).toBe(stringMockCookieValue);
    expect(globalThis.cookieStore.get).toHaveBeenCalledWith(mockCookieName);
  });

  it("should return undefined if cookie not found in cookieStore", async () => {
    // Mock cookieStore
    globalThis.cookieStore = {
      ...cookieStoreCommonMock,
      get: vi.fn().mockResolvedValue(undefined),
    };
    const result = await getCookieValueByName(notMockCookieName);
    expect(result).toBeUndefined();
    expect(globalThis.cookieStore.get).toHaveBeenCalledWith(notMockCookieName);
  });

  it.skip("should fallback to document.cookie when cookieStore throws", async () => {
    // Mock cookieStore
    globalThis.cookieStore = {
      ...cookieStoreCommonMock,
      get: vi.fn().mockRejectedValue(new Error("Oops, CookieStore failed unexpectedly!")),
    };
    // Set cookie via document.cookie
    globalThis.document.cookie = `${mockCookieName}=${stringMockCookieValue}; ${cookiePath};`;
    const result = await getCookieValueByName(mockCookieName);
    expect(result).toBe(stringMockCookieValue); // ------
  });

  it.skip("should fallback to document.cookie when cookieStore is not available", async () => {
    // Set cookie via document.cookie with string value
    globalThis.document.cookie = `${mockCookieName}=${stringMockCookieValue}; ${cookiePath};`;
    const result = await getCookieValueByName(mockCookieName);
    expect(result).toBe(stringMockCookieValue); //------
  });

  it.skip("should decode URI-encoded values from document.cookie", async () => {
    // Set cookie via document.cookie with URI encoded value
    globalThis.document.cookie = `${mockCookieName}=${encodedMockCookieValue}; ${cookiePath};`;
    const result = await getCookieValueByName(mockCookieName);
    expect(result).toBe(decodedMockCookieValue); // -------
  });

  it("should handle empty document.cookie", async () => {
    // We are not setting any cookie so it should be an empty string
    expect(globalThis.document.cookie).toBe("");
    const result = await getCookieValueByName(mockCookieName);
    expect(result).toBeUndefined();
  });

  it("should return undefined when cookie is not found in document.cookie", async () => {
    // Set a cookie with another name via document.cookie
    globalThis.document.cookie = `${notMockCookieName}=${stringMockCookieValue}; ${cookiePath};`;
    const result = await getCookieValueByName(mockCookieName);
    expect(result).toBeUndefined();
  });

  it("should handle malformed cookies gracefully", async () => {
    // Intentionally set a malformed cookie by not providing the value, or the =
    globalThis.document.cookie = `${mockCookieName}; ${cookiePath};`;
    const result = await getCookieValueByName(mockCookieName);
    expect(result).toBeUndefined();
  });
});
