/**
 * Return an item from an array
 * @param items like : ["great", "place", "pine"]
 * @returns item like : "pine"
 */
export function pickOne<Type>(items: readonly Type[]) {
  // eslint-disable-next-line no-restricted-syntax
  if (items.length === 0) throw new Error('Array is empty')
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-type-assertion
  return items[Math.floor(Math.random() * items.length)] as Type
}
