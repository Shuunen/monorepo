/**
 * Creates a function that memoizes the result of `callback`
 * @copyright inspired from Angus Croll package `just-memoize` under MIT License Copyright (c) 2016-2023
 * @param callback the function to memoize
 * @returns a memoized function
 */ export function memoize(callback) {
    if (typeof callback !== 'function') throw new Error('memoize callback parameter should be a function');
    const cache = {};
    /**
   * The memoized function
   * @param parameters the arguments to pass to the callback
   * @returns the result of the callback
   */ function memoized(...parameters) {
        const key = JSON.stringify(parameters);
        // @ts-expect-error cache[key] is unknown
        if (!(key in cache)) cache[key] = callback(...parameters);
        // oxlint-disable no-non-null-assertion
        // biome-ignore lint/style/noNonNullAssertion: needed here
        return cache[key];
    }
    memoized.cache = cache;
    return memoized;
}

//# sourceMappingURL=memoize.js.map