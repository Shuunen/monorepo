import { Result } from "./result.js";

/**
 * Fetches raw data from the specified URL using the provided request options.
 * Wraps the fetch in a Result type for safe error handling.
 *
 * @param url - The URL to fetch data from.
 * @param options - The request options to pass to the fetch API.
 * @returns A promise that resolves to a Result containing the raw data or an error if the fetch fails.
 */
export async function fetchRaw(url: string, options: RequestInit) {
  const result = await Result.trySafe(fetch(url, options));
  if (!result.ok) {
    return Result.error(String(result.error));
  }
  return result;
}

/**
 * Fetches JSON data from the specified URL using the provided request options.
 * Wraps the fetch and JSON parsing in a Result type for safe error handling.
 *
 * @param url - The URL to fetch data from.
 * @param options - The request options to pass to the fetch API.
 * @returns A promise that resolves to a Result containing the parsed JSON data or an error if the fetch or parsing fails.
 */
export async function fetchJson(url: string, options: RequestInit) {
  const response = await fetchRaw(url, options);
  if (!response.ok) {
    return Result.error(`fetch failed : ${response.error}`);
  }
  const result = await Result.trySafe(response.value.json());
  if (!result.ok) {
    return Result.error(String(result.error));
  }
  return result;
}
