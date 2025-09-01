/**
 * Return an item from an array
 * @param items like : ["great", "place", "pine"]
 * @returns item like : "pine"
 */
export function pickOne<Type>(items: readonly Type[]) {
  if (items.length === 0) throw new Error('Array is empty')
  return items[Math.floor(Math.random() * items.length)] as Type
}
