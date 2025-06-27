/**
 * Convert a multi-level deep object into a single-level, flatten, object
 * @param object the object to flatten
 * @param path optional, add a root path to all keys
 * @param separator optional, the character to join keys
 * @returns object like `{ 'person.name': 'John Doe', 'person.age': 32 }`
 */ export function flatten(object, path = '', separator = '.') {
    const result = {};
    for (const key of Object.keys(object)){
        const value = object[key];
        const updatedPath = Array.isArray(object) ? `${path}[${key}]` : [
            path,
            key
        ].filter(Boolean).join(separator);
        const isObject = [
            typeof value === 'object',
            value !== null,
            !(value instanceof Date),
            !(value instanceof RegExp),
            !(Array.isArray(value) && value.length === 0)
        ].every(Boolean);
        if (isObject) Object.assign(result, flatten(value, updatedPath, separator));
        else result[updatedPath] = value;
    }
    return result;
}

//# sourceMappingURL=object-flatten.js.map