/**
 * Creates a function that memoizes the result of `callback`
 * @copyright inspired from Angus Croll package `just-memoize` under MIT License Copyright (c) 2016-2023
 * @param callback the function to memoize
 * @returns a memoized function
 */
export function memoize<Callback extends (...arguments_: Parameters<Callback>) => unknown>(callback: Callback) {
  if (typeof callback !== "function") {
    throw new TypeError("memoize callback parameter should be a function");
  }
  const cache: Record<string, ReturnType<Callback>> = {};
  /**
   * The memoized function
   * @param parameters the arguments to pass to the callback
   * @returns the result of the callback
   */
  function memoized(...parameters: Parameters<Callback>) {
    const key = JSON.stringify(parameters);
    if (!(key in cache)) {
      // @ts-expect-error cache[key] is unknown
      cache[key] = callback(...parameters);
    }
    // oxlint-disable no-non-null-assertion
    // biome-ignore lint/style/noNonNullAssertion: needed here
    return cache[key]!;
  }
  memoized.cache = cache;
  return memoized as unknown as Callback;
}
