import { objectSerialize } from './object-serializer.js';
/**
 * Check if two objects are deeply equal
 * @param objectA the base object to compare
 * @param objectB the object to compare with
 * @param willSortKeys if true, the order of keys will be sorted alpha before comparison
 * @returns true if the two objects are deeply equal
 */ export function objectEqual(objectA, objectB, willSortKeys = false) {
    return objectSerialize(objectA, willSortKeys) === objectSerialize(objectB, willSortKeys);
}

//# sourceMappingURL=object-equal.js.map