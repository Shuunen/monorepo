/* c8 ignore next */
import type { Item } from '../types/item.types'
import { itemToLocation } from './item.utils'

/**
 * Generate a name from an item
 * @param item - the item to generate the name from
 * @returns the generated name
 */
function itemToPrintText(item: Item) {
  return [item.name, item.brand, item.details]
    .join(' ')
    .replace(/\s{2,}/gu, ' ')
    .trim()
}

/**
 * Get a reference or barcode from an item
 * @param item - the item to generate the code from
 * @returns the generated code like '123456'
 */
function itemToPrintCode(item: Item) {
  const reference = item.reference.trim()
  if (reference.length > 0) return reference
  const barcode = item.barcode.trim()
  if (barcode.length > 0) return barcode
  return ''
}

/**
 * Get print data from item
 * @param item the item
 * @returns the data
 */
export function itemToPrintData(item: Item) {
  return {
    location: itemToLocation(item, true),
    text: itemToPrintText(item),
    value: itemToPrintCode(item),
  }
}
