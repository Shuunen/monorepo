import { nbSpacesIndent } from "./constants.js";
import { flatten } from "./object-flatten.js";

// oxlint-disable require-param-description
/**
 * Fill mustaches in a given string
 * @param template The input string, like "Hello {{ name }} !".
 * @param data The input object, like { name: "world" }.
 * @returns The filled string, e.g. "Hello world !"
 */

export function fillTemplate(
  template: Readonly<Record<string, unknown>> | string,
  data?: Readonly<Record<string, unknown>>,
) {
  // oxlint-enable require-param-description
  let string = typeof template === "object" ? JSON.stringify(template, undefined, nbSpacesIndent) : template;
  if (data === undefined) {
    return string;
  }
  if (string.length === 0) {
    return string;
  }
  const flatData = flatten(data);
  for (const [key, value] of Object.entries(flatData)) {
    const regex = new RegExp(`(/?\\*?{{?\\s*${key}\\s*}?}\\*?/?)`, "g");
    string = string.replace(regex, String(value));
  }
  return string;
}
