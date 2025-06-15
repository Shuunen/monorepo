// Credits to : https://github.com/sindresorhus/yoctocolors/blob/main/index.js
// oxlint-disable no-magic-numbers

/**
 * Check if the browser is Firefox
 * @returns boolean if the browser is Firefox
 */
export function isFirefox() {
  /* c8 ignore next */
  if (globalThis.navigator === undefined) return false
  return globalThis.navigator.userAgent.includes('Firefox')
}

/**
 * Wrap a string with a color code
 * @param from the color code to start the color
 * @param to the color code to end the color
 * @param string the string to wrap
 * @returns the string with the color code
 */
export function addColorCode(from: number, to: number, string: string) {
  /* c8 ignore next */
  return isFirefox() ? string : `\u001B[${from}m${string}\u001B[${to}m`
}

/**
 * Reset the string color to the default terminal color
 * @param string the string to reset
 * @returns the string with the reset color
 */
export function reset(string: string) {
  return addColorCode(0, 0, string)
}

/**
 * Render a bold string for the terminal
 * @param string the string to render
 * @returns the string with the bold decoration
 */
export function bold(string: string) {
  return addColorCode(1, 22, string)
}

/**
 * Render a dim string for the terminal
 * @param string the string to render
 * @returns the string with the dim decoration
 */
export function dim(string: string) {
  return addColorCode(2, 22, string)
}

/**
 * Render a italic string for the terminal
 * @param string the string to render
 * @returns the string with the italic decoration
 */
export function italic(string: string) {
  return addColorCode(3, 23, string)
}

/**
 * Render a underline string for the terminal
 * @param string the string to render
 * @returns the string with the underline decoration
 */
export function underline(string: string) {
  return addColorCode(4, 24, string)
}

/**
 * Render a overline string for the terminal
 * @param string the string to render
 * @returns the string with the overline decoration
 */
export function overline(string: string) {
  return addColorCode(53, 55, string)
}

/**
 * Render an inverse string for the terminal
 * @param string the string to render
 * @returns the string with the inverse decoration
 */
export function inverse(string: string) {
  return addColorCode(7, 27, string)
}

/**
 * Render a strike-through string for the terminal
 * @param string the string to render
 * @returns the string with the strike-through decoration
 */
export function strikeThrough(string: string) {
  return addColorCode(9, 29, string)
}

/**
 * Render a black string for the terminal
 * @param string the string to render
 * @returns the string with the black color
 */
export function black(string: string) {
  return addColorCode(30, 39, string)
}

/**
 * Render a red string for the terminal
 * @param string the string to render
 * @returns the string with the red color
 */
export function red(string: string) {
  return addColorCode(31, 39, string)
}

/**
 * Render a green string for the terminal
 * @param string the string to render
 * @returns the string with the green color
 */
export function green(string: string) {
  return addColorCode(32, 39, string)
}

/**
 * Render a yellow string for the terminal
 * @param string the string to render
 * @returns the string with the yellow color
 */
export function yellow(string: string) {
  return addColorCode(33, 39, string)
}

/**
 * Render a blue string for the terminal
 * @param string the string to render
 * @returns the string with the blue color
 */
export function blue(string: string) {
  return addColorCode(34, 39, string)
}

/**
 * Render a magenta string for the terminal
 * @param string the string to render
 * @returns the string with the magenta color
 */
export function magenta(string: string) {
  return addColorCode(35, 39, string)
}

/**
 * Render a cyan string for the terminal
 * @param string the string to render
 * @returns the string with the cyan color
 */
export function cyan(string: string) {
  return addColorCode(36, 39, string)
}

/**
 * Render a white string for the terminal
 * @param string the string to render
 * @returns the string with the white color
 */
export function white(string: string) {
  return addColorCode(37, 39, string)
}

/**
 * Render a gray string for the terminal
 * @param string the string to render
 * @returns the string with the gray color
 */
export function gray(string: string) {
  return addColorCode(90, 39, string)
}

/**
 * Render a string on a black background for the terminal
 * @param string the string to render
 * @returns the string with the black background
 */
export function bgBlack(string: string) {
  return addColorCode(40, 49, string)
}

/**
 * Render a string on a red background for the terminal
 * @param string the string to render
 * @returns the string with the red background
 */
export function bgRed(string: string) {
  return addColorCode(41, 49, string)
}

/**
 * Render a string on a green background for the terminal
 * @param string the string to render
 * @returns the string with the green background
 */
export function bgGreen(string: string) {
  return addColorCode(42, 49, string)
}

/**
 * Render a string on a yellow background for the terminal
 * @param string the string to render
 * @returns the string with the yellow background
 */
export function bgYellow(string: string) {
  return addColorCode(43, 49, string)
}

/**
 * Render a string on a blue background for the terminal
 * @param string the string to render
 * @returns the string with the blue background
 */
export function bgBlue(string: string) {
  return addColorCode(44, 49, string)
}

/**
 * Render a string on a magenta background for the terminal
 * @param string the string to render
 * @returns the string with the magenta background
 */
export function bgMagenta(string: string) {
  return addColorCode(45, 49, string)
}

/**
 * Render a string on a cyan background for the terminal
 * @param string the string to render
 * @returns the string with the cyan background
 */
export function bgCyan(string: string) {
  return addColorCode(46, 49, string)
}

/**
 * Render a string on a white background for the terminal
 * @param string the string to render
 * @returns the string with the white background
 */
export function bgWhite(string: string) {
  return addColorCode(47, 49, string)
}

/**
 * Render a string on a gray background for the terminal
 * @param string the string to render
 * @returns the string with the gray background
 */
export function bgGray(string: string) {
  return addColorCode(100, 49, string)
}
