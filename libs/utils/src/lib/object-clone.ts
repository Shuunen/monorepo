import { objectDeserialize, objectSerialize } from './object-serializer.js'
import type { Mutable } from './types.js'

/**
 * Return a deep copy of an object or array
 * @param object an object or array to clone
 * @returns the copy
 */
export function clone<Type>(object: Readonly<Type>) {
  try {
    return structuredClone(object) as Mutable<Type>
  } catch {
    return objectDeserialize(objectSerialize(object)) as Mutable<Type>
  }
}
