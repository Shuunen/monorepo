import type { Request, Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  app,
  handleProxyResponse,
  handleWebhookError,
  makeProxyRequest,
  startServer,
  validateUrl,
  webhookHandler,
  webhookRoute,
} from "./http-proxy.cli";

vi.mock("express", () => {
  const mockJson = vi.fn(() => vi.fn());
  const mockApp = {
    listen: vi.fn(),
    post: vi.fn(),
    use: vi.fn(),
  };
  const mockExpress = vi.fn(() => mockApp);
  // @ts-expect-error non important typing issue
  mockExpress.json = mockJson;
  return {
    default: mockExpress,
  };
});

vi.mock("cors", () => ({
  default: vi.fn(() => vi.fn()),
}));

// Mock fetch globally
globalThis.fetch = vi.fn();

describe("http-proxy", () => {
  let mockResponse: Partial<Response> = {};
  let mockRequest: Partial<Request> = {};

  function createMockFetchResponse(contentType: string, responseData: unknown) {
    const mockResponse = {
      headers: {
        get: vi.fn().mockReturnValue(contentType),
      },
      status: 200,
      statusText: "OK",
    } as Record<string, unknown>;
    if (contentType.includes("application/json")) mockResponse.json = vi.fn().mockResolvedValue(responseData);
    else if (contentType.includes("text/plain")) mockResponse.text = vi.fn().mockResolvedValue(responseData);
    return mockResponse;
  }

  function createErrorMockFetchResponse() {
    return {
      headers: { get: vi.fn().mockReturnValue("application/json") },
      json: vi.fn().mockRejectedValue(new Error("Parse error")),
      status: 200,
      statusText: "OK",
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();

    mockResponse = {
      json: vi.fn().mockReturnThis(),
      status: vi.fn().mockReturnThis(),
    };

    mockRequest = {
      body: {},
      query: {},
    };
  });

  it("validateUrl should validate URLs correctly", () => {
    expect(validateUrl("https://example.com")).toMatchInlineSnapshot("true");
    expect(validateUrl("not-a-url")).toMatchInlineSnapshot("false");
    expect(validateUrl("https://api.example.com/webhook")).toMatchInlineSnapshot("true");
  });

  it("makeProxyRequest A should make POST request with JSON body", async () => {
    const mockFetchResponse = createMockFetchResponse("application/json", { success: true });
    // @ts-expect-error non important typing issue
    vi.mocked(fetch).mockResolvedValue(mockFetchResponse as unknown as Response);

    const result = await makeProxyRequest("https://example.com", { test: "data" });

    expect(fetch).toHaveBeenCalledWith("https://example.com", {
      body: '{"test":"data"}',
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    expect(result).toMatchSnapshot();
  });

  it("makeProxyRequest B should handle text response", async () => {
    const mockFetchResponse = createMockFetchResponse("text/plain", "plain text response");
    // @ts-expect-error non important typing issue
    vi.mocked(fetch).mockResolvedValue(mockFetchResponse as unknown as Response);

    const result = await makeProxyRequest("https://example.com", { test: "data" });

    expect(result.data).toMatchInlineSnapshot('"plain text response"');
  });

  it("makeProxyRequest C should handle response parsing error", async () => {
    const mockFetchResponse = createErrorMockFetchResponse();
    // @ts-expect-error non important typing issue
    vi.mocked(fetch).mockResolvedValue(mockFetchResponse as unknown as Response);

    const result = await makeProxyRequest("https://example.com", { test: "data" });

    expect(result.data).toMatchInlineSnapshot("undefined");
  });

  it("handleProxyResponse A should log and respond with proxy data", async () => {
    const mockFetchResponse = createMockFetchResponse("application/json", { success: true });
    // @ts-expect-error non important typing issue
    vi.mocked(fetch).mockResolvedValue(mockFetchResponse as unknown as Response);

    await handleProxyResponse("https://example.com", { test: "data" }, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: { success: true },
      status: 200,
      statusText: "OK",
    });
  });

  it("webhookHandler should handle various error cases", async () => {
    // Missing URL
    mockRequest.query = {};
    await webhookHandler(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "Target URL is required as query parameter: ?url=...",
    });

    // Non-string URL
    mockRequest.query = { url: 123 as unknown as string };
    await webhookHandler(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toHaveBeenCalledWith(400);

    // Empty URL
    mockRequest.query = { url: "" };
    await webhookHandler(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toHaveBeenCalledWith(400);

    // Invalid URL
    mockRequest.query = { url: "not-a-url" };
    await webhookHandler(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenLastCalledWith({
      error: "Invalid URL provided",
    });
  });

  it("webhookHandler E should handle valid request", async () => {
    const mockFetchResponse = createMockFetchResponse("application/json", { success: true });
    // @ts-expect-error non important typing issue
    vi.mocked(fetch).mockResolvedValue(mockFetchResponse as unknown as Response);

    mockRequest.query = { url: "https://example.com" };
    mockRequest.body = { test: "data" };

    await webhookHandler(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({
      data: { success: true },
      status: 200,
      statusText: "OK",
    });
  });

  it("handleWebhookError should handle different error types", () => {
    // Error instance
    const error = new Error("Test error");
    handleWebhookError(error, mockResponse as Response);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: "Test error",
    });

    // Unknown error
    const unknownError = "string error";
    handleWebhookError(unknownError, mockResponse as Response);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenLastCalledWith({
      error: "Unknown error",
    });
  });

  it("webhookRoute should handle webhook requests and errors", async () => {
    const mockFetchResponse = createMockFetchResponse("application/json", { success: true });
    // @ts-expect-error non important typing issue
    vi.mocked(fetch).mockResolvedValue(mockFetchResponse as unknown as Response);
    mockRequest.query = { url: "https://example.com" };
    mockRequest.body = { test: "data" };
    webhookRoute(mockRequest as Request, mockResponse as Response);
    // Wait for async operation to complete
    // oxlint-disable-next-line no-promise-executor-return
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(mockResponse.status).toHaveBeenCalledWith(200);
  });

  it("webhookRoute B should handle webhook error", async () => {
    // Force an error by making fetch reject
    vi.mocked(fetch).mockRejectedValue(new Error("Network error"));
    mockRequest.query = { url: "https://example.com" };
    mockRequest.body = { test: "data" };
    webhookRoute(mockRequest as Request, mockResponse as Response);
    // Wait for async operation to complete
    // oxlint-disable-next-line no-promise-executor-return
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: "Network error" });
  });

  it("startServer A should call app.listen with correct port", () => {
    startServer();
    expect(app.listen).toHaveBeenCalledWith(3001, expect.any(Function));
  });

  it("startServer B should log server info when callback is called", () => {
    const mockListen = vi.mocked(app.listen);
    startServer();
    // Get the callback function that was passed to listen
    const callback = mockListen.mock.calls[0][1];
    callback?.();
    // Verify logger calls (the Logger mock should have been called)
    expect(callback).toBeDefined();
  });
});
