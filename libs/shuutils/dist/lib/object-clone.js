import { objectDeserialize, objectSerialize } from './object-serializer.js';
/**
 * Return a deep copy of an object or array
 * @param object an object or array to clone
 * @returns the copy
 */ export function clone(object) {
    try {
        return structuredClone(object);
    } catch (e) {
        return objectDeserialize(objectSerialize(object));
    }
}

//# sourceMappingURL=object-clone.js.map