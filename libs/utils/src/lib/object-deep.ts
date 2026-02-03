/**
 * Get a nested value from an object
 * @see https://github.com/developit/dlv/blob/master/index.js
 * @see https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/dlv/index.d.ts
 * @param object the object to get the value from
 * @param path the path to the value
 * @param defaultValue the default value to return if the path does not exist
 * @returns the value at the specified path
 */
export function getNested(
  object: Record<string, unknown> | undefined,
  path: string | Array<string | number>,
  defaultValue?: unknown,
) {
  const pathArray = typeof path === "string" ? path.split(".") : path;
  let result: unknown = object;
  for (const key of pathArray) {
    result = result && typeof result === "object" ? (result as Record<string, unknown>)[key] : undefined;
  }

  return result === undefined ? defaultValue : result;
}

export { dset as setNested } from "dset";
