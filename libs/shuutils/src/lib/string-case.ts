/**
 * Convert kebab-case to PascalCase
 * @param kebab the kebab-case string like 'dropdown-menu'
 * @param joinChar the character to join the string parts
 * @returns The PascalCase string like 'DropdownMenu'
 */
export function kebabToPascalCase(kebab: string, joinChar = '') {
  return kebab
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(joinChar)
}
