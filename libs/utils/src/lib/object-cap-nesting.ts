/**
 * Cap the nesting level of an object
 * @param object the object to cap
 * @param maxLevel like : `2`
 * @returns item like : `{ name : "Pine" }`
 */
export function capNesting(object: Readonly<Record<string, unknown>>, maxLevel = 3) {
  const one = 1;
  /**
   * Helper function to cap the nesting level of an object.
   * @param currentObject - The current object to cap the nesting level.
   * @param currentLevel - The current nesting level.
   * @returns The capped object.
   */
  function capHelper(currentObject: null | typeof object, currentLevel: number) {
    if (currentLevel > maxLevel) {
      return "...";
    }
    if (typeof currentObject !== "object" || currentObject === null) {
      return currentObject;
    }
    const result = Array.isArray(currentObject) ? [] : {};
    for (const key in currentObject) {
      if (Object.hasOwn(currentObject, key)) {
        // @ts-expect-error type issue
        result[key] = capHelper(currentObject[key], currentLevel + one);
      }
    }
    return result;
  }
  return capHelper(object, one);
}
