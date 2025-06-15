import { objectDeserialize, objectSerialize } from './object-serializer.js'
import type { Mutable } from './types.js'

/**
 * Return a deep copy of an object or array
 * @param object like : `{ name : "Pine" }`
 * @returns item copy like : `{ name : "Pine" }`
 */
export function clone<Type>(object: Readonly<Type>) {
  try {
    return structuredClone(object) as Mutable<Type>
  } catch {
    return objectDeserialize(objectSerialize(object)) as Mutable<Type>
  }
}
