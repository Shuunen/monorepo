/**
 * Sleep let you "pause" or delay processes
 * @param ms the time to wait in milliseconds, default 1000ms / 1 sec
 * @returns promise that resolve in the provided time
 */
export async function sleep(ms = 1000) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(ms)
    }, ms)
  })
}

/**
 * Determine whether the given object has a property
 * @param object the object to test
 * @param property the property to test
 * @returns true if the object has the property
 */
export function hasOwn(object: object, property: string) {
  return Object.hasOwn(object, property)
}

/* eslint-disable no-restricted-syntax, @typescript-eslint/no-empty-function */
/**
 * A function that returns void, handy for initializing variables.
 */
// biome-ignore lint/suspicious/noEmptyBlockStatements: <explanation>
export function functionReturningVoid(): void {}
/* eslint-enable no-restricted-syntax, @typescript-eslint/no-empty-function */

/**
 * A function that returns `undefined`, handy for initializing variables.
 * @returns `undefined`
 */
export function functionReturningUndefined() {
  // eslint-disable-next-line unicorn/no-useless-undefined
  return undefined
}
