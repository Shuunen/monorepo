/**
 * Determine whether the given object has a property
 * @param object the object to test
 * @param property the property to test
 * @returns true if the object has the property
 */
export function hasOwn(object: object, property: string) {
  return Object.hasOwn(object, property);
}

// oxlint-disable no-empty-function
/**
 * A function that returns void, handy for initializing variables.
 */
export function functionReturningVoid(): void {} // NOSONAR
// oxlint-enable no-empty-function

/**
 * A function that returns `undefined`, handy for initializing variables.
 * @returns `undefined`
 */
export function functionReturningUndefined() {
  return undefined;
}
