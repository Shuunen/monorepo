/**
 * Convert kebab-case to PascalCase
 * @param kebab the kebab-case string like 'dropdown-menu'
 * @param joinChar the character to join the string parts
 * @returns The PascalCase string like 'DropdownMenu'
 */
export function kebabToPascalCase(kebab: string, joinChar = "") {
  return kebab
    .split("-")
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(joinChar);
}

/**
 * Converts a camelCase string to kebab-case
 * @param camel the camelCase string to convert, like 'myVariableName'
 * @returns The kebab-case version of the input string, like 'my-variable-name'
 */
export function camelToKebabCase(camel: string) {
  return camel
    .replaceAll(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replaceAll(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .replaceAll(/[\s_]+/g, "-")
    .toLowerCase();
}
