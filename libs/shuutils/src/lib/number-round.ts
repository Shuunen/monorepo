/**
 * Round a number to a given number of decimals
 * @param number the number to round
 * @param nbDecimals the number of decimals to keep
 * @returns the rounded number
 * @example round(1.2345, 2) // returns 1.23
 */
export function round(number: number, nbDecimals = 2) {
  return Math.round(number * 10 ** nbDecimals) / 10 ** nbDecimals // eslint-disable-line @typescript-eslint/no-magic-numbers
}
