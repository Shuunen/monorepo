// oxlint-disable max-lines
import { readFileSync } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { request } from "node:https";
import path from "node:path";
import type { PassThrough } from "node:stream";
import { fileURLToPath } from "node:url";

// populate .env variables from .env file if process.env.HUE_ENDPOINT or process.env.TRMNL_ENDPOINT not set
if (!process.env.HUE_ENDPOINT || !process.env.TRMNL_ENDPOINT) {
  const dirname = typeof __dirname === "undefined" ? path.dirname(fileURLToPath(import.meta.url)) : __dirname;
  const dotenv = readFileSync(`${dirname}/.env`, "utf8");
  const lines = dotenv.toString().split("\n");
  for (const line of lines) {
    const [key, value] = line.split("=");
    if (key && value && !process.env[key]) process.env[key] = value;
  }
}

export const options = {
  codes: {
    badRequest: 400,
    notFound: 404,
    ok: 200,
  },
  dateTimeSlice: 19,
  hueMax: 20_000,
  maxProgress: 100,
  port: 3000,
  severityPadding: 7,
} as const;

export function datetime() {
  return new Date().toISOString().replace("T", " ").slice(0, options.dateTimeSlice);
}

export function log(severity: "info" | "warn" | "error", context: string, ...args: unknown[]) {
  // if in unit test, do not log
  if (process.env.VITEST) return;
  const paddedSeverity = `[${severity}]`.padStart(options.severityPadding);
  // biome-ignore lint/suspicious/noConsole: allowed in this context
  console.log(`${datetime()} ${paddedSeverity} [${context}]`, ...args); // oxlint-disable-line no-console
}

export function getHueColor(percent: number): number {
  return Math.round((percent * options.hueMax) / options.maxProgress);
}

export function getHueColorBody(percent: number) {
  const isEverythingDone = percent === options.maxProgress;
  return JSON.stringify({ bri: 255, hue: getHueColor(percent), on: !isEverythingDone, sat: 255 });
}

export function jsonResponse({
  ok,
  message,
  progress,
  response,
  data,
  remaining,
  nextTask,
}: {
  ok: boolean;
  message: string;
  progress: number;
  response: unknown;
  data: unknown;
  remaining: unknown;
  nextTask: unknown;
}) {
  return JSON.stringify({ data, datetime: datetime(), message, nextTask, ok, progress, remaining, response });
}

export function sendCorsHeaders(res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export function flattenResponse(
  resolve: (value: { result: unknown; error: string | undefined }) => void,
  getData: () => string,
) {
  return (res: IncomingMessage | PassThrough) => {
    let data = getData();
    res.on("data", (chunk: Buffer) => {
      data += chunk.toString();
    });
    res.once("end", () => {
      let result: unknown = "";
      try {
        result = JSON.parse(data);
      } catch {
        result = data;
      }
      resolve({ error: undefined, result });
    });
  };
}

export function makeRequest({
  url,
  method,
  payload,
}: {
  url: string;
  method: string;
  payload: string;
}): Promise<{ result: unknown; error: string | undefined }> {
  return new Promise(resolve => {
    if (url.includes("fake-endpoint.local")) {
      void resolve({
        error: undefined,
        result: { message: "This is a fake endpoint response for testing.", success: true },
      });
      return;
    }
    const req = request(url, {
      headers: { "Content-Length": Buffer.byteLength(payload), "Content-Type": "application/json" },
      method,
      rejectUnauthorized: false,
    });
    const data = "";
    req.on(
      "response",
      flattenResponse(resolve, () => data),
    );
    req.on("error", err => resolve({ error: err.message, result: undefined }));
    req.write(payload);
    req.end();
  });
}

export function respondNotFound(res: ServerResponse) {
  log("warn", "respondNotFound", "Responding with 404 Not Found");
  res.writeHead(options.codes.notFound, { "Content-Type": "application/json" });
  res.end(
    jsonResponse({
      data: undefined,
      message: "Not Found",
      nextTask: undefined,
      ok: false,
      progress: 0,
      remaining: undefined,
      response: undefined,
    }),
  );
}

export function respondBadRequest({
  res,
  message,
  progress,
  nextTask,
  remaining,
}: {
  res: ServerResponse;
  message: string;
  progress: number;
  nextTask: unknown;
  remaining: unknown;
}) {
  log("warn", "respondBadRequest", `Bad request, message : ${message}`);
  res.writeHead(options.codes.badRequest, { "Content-Type": "application/json" });
  res.end(jsonResponse({ data: undefined, message, nextTask, ok: false, progress, remaining, response: undefined }));
}

export function collectRequestBody(req: IncomingMessage | PassThrough): Promise<string> {
  const context = "collectRequestBody";
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk: Buffer) => {
      body += chunk.toString();
      log("info", context, `Received data chunk for request body: ${chunk.length} bytes`);
    });
    req.once("end", () => {
      log("info", context, `Request body fully received: ${body.length} bytes`);
      resolve(body);
    });
    req.on("error", error => {
      log("error", context, `Error receiving request body: ${error?.message ?? error}`);
      reject(error);
    });
  });
}

// Parse application/x-www-form-urlencoded string to object
export function parseFormUrlEncoded(body: string): Record<string, string> {
  const result: Record<string, string> = {};
  const pairs = body.split("&");
  for (const pair of pairs) {
    const [key, value] = pair.split("=");
    if (key) result[decodeURIComponent(key)] = decodeURIComponent(value ?? "");
  }
  return result;
}

export function parseProgressBody(body: string) {
  let progress = 0;
  let remaining: unknown = undefined;
  let nextTask: unknown = undefined;
  let parseError: string | undefined = undefined;
  const context = "parseProgressBody";
  try {
    log("info", context, `Parsing progress body : ${body}`);
    const parsedBody = parseFormUrlEncoded(body);
    if (
      typeof parsedBody !== "object" ||
      parsedBody === null ||
      Array.isArray(parsedBody) ||
      (parsedBody as Record<string, unknown>).progress === undefined
    ) {
      parseError = `Invalid body : must be an object with a progress property, got "${body}"`;
      return { error: parseError, nextTask, progress, remaining };
    }
    progress = Number.parseInt(parsedBody.progress ?? "0", 10);
    remaining = parsedBody.remaining ?? undefined;
    nextTask = parsedBody.nextTask ?? undefined;
    if (!Number.isInteger(progress) || progress < 0 || progress > options.maxProgress) {
      parseError = "Invalid progress value. It must be an integer between 0 and 100.";
      log("warn", context, `Progress value invalid: ${progress}`);
    }
  } catch (error) {
    parseError = `Error parsing progress body : ${error instanceof Error ? error.message : error}`;
    log("error", context, parseError);
  }
  return { error: parseError, nextTask, progress, remaining };
}

// oxlint-disable-next-line max-lines-per-function, max-statements
export async function handleSetProgressRequest({ body, res }: { body: string; res: ServerResponse }) {
  const context = "handleSetProgressRequest";
  log("info", context, "Handling set-progress request");
  const { progress, nextTask, remaining, error } = parseProgressBody(body);
  log(
    "info",
    context,
    `Parsed progress body: progress=${progress}, nextTask=${nextTask}, remaining=${remaining}, error=${error}`,
  );
  if (error) {
    log("warn", context, `Progress body error: ${error}`);
    res.writeHead(options.codes.badRequest, { "Content-Type": "application/json" });
    res.end(
      jsonResponse({ data: undefined, message: error, nextTask, ok: false, progress, remaining, response: undefined }),
    );
    return;
  }
  const hueEndpoint = process.env.HUE_ENDPOINT ?? "";
  if (!hueEndpoint) {
    log("error", context, "HUE_ENDPOINT not set in env variables");
    return respondBadRequest({ message: "HUE_ENDPOINT not set in env variables", nextTask, progress, remaining, res });
  }
  const trmnlEndpoint = process.env.TRMNL_ENDPOINT ?? "";
  if (!trmnlEndpoint) {
    log("error", context, "TRMNL_ENDPOINT not set in env variables");
    return respondBadRequest({
      message: "TRMNL_ENDPOINT not set in env variables",
      nextTask,
      progress,
      remaining,
      res,
    });
  }
  const hueBody = getHueColorBody(progress);
  log("info", context, `Prepared hue body: ${hueBody}`);
  const trmnlPayload = JSON.stringify({
    // biome-ignore lint/style/useNamingConvention: cannot change external API
    merge_variables: {
      nextTitle: nextTask,
      progress,
      remaining: remaining ? `${remaining} min to take care` : undefined,
    },
  });
  log("info", context, `Prepared trmnl payload: ${trmnlPayload}`);
  const [hueResult, trmnlResult] = await Promise.all([
    makeRequest({ method: "PUT", payload: hueBody, url: hueEndpoint }),
    makeRequest({ method: "POST", payload: trmnlPayload, url: trmnlEndpoint }),
  ]);
  log("info", context, `Hue result: error=${hueResult.error}, result=${JSON.stringify(hueResult.result)}`);
  log("info", context, `Trmnl result: error=${trmnlResult.error}, result=${JSON.stringify(trmnlResult.result)}`);
  const ok = !hueResult.error && !trmnlResult.error;
  log(ok ? "info" : "error", context, `Responding to /set-progress: ok=${ok}`);
  res.writeHead(options.codes.ok, { "Content-Type": "application/json" });
  res.end(
    jsonResponse({
      data: JSON.parse(hueBody),
      message: ok
        ? "Emitted hue and trmnl color successfully"
        : `Error: ${hueResult.error ?? ""} ${trmnlResult.error ?? ""}`,
      nextTask,
      ok,
      progress,
      remaining,
      response: {
        hue: hueResult.error ?? hueResult.result,
        trmnl: trmnlResult.error ?? trmnlResult.result,
      },
    }),
  );
}

export function handlePostSetProgress(req: IncomingMessage, res: ServerResponse) {
  const context = "handlePostSetProgress";
  log("info", context, `Received POST request for ${req.url}`);
  collectRequestBody(req)
    .then(body => {
      log("info", context, "Request body collected for /set-progress");
      return handleSetProgressRequest({ body, res });
    })
    .catch(error => {
      log("error", context, `Error collecting request body: ${error?.message ?? error}`);
      respondBadRequest({
        message: "Failed to read request body",
        nextTask: undefined,
        progress: 0,
        remaining: undefined,
        res,
      });
    });
}

export const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  const context = "createServer";
  sendCorsHeaders(res);
  if (req.method === "OPTIONS") {
    log("info", context, "OPTIONS request received, sending CORS headers");
    res.writeHead(options.codes.ok);
    res.end();
    return;
  }
  if (req.method === "POST" && req.url === "/set-progress") {
    log("info", context, "POST /set-progress request received");
    handlePostSetProgress(req, res);
    return;
  }
  if (req.method === "GET" && req.url === "/hello") {
    log("info", context, "GET /hello request received");
    res.writeHead(options.codes.ok, { "Content-Type": "text/plain" });
    res.end(`HelloOoOOoo ! It is ${datetime()} :D`);
    return;
  }
  log("warn", context, `Unknown route method "${req.method}" with url "${req.url}"`);
  respondNotFound(res);
});

if (globalThis.window === undefined)
  server.listen(options.port, () => {
    log("info", "listen", `Server running at http://localhost:${options.port}`);
    log("info", "listen", `Exposing  GET http://localhost:${options.port}/hello`);
    log("info", "listen", `Exposing POST http://localhost:${options.port}/set-progress`);
  });
