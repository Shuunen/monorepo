import { parseJson } from './json.js';
/**
 * Get a value from the storage media
 * @param key The key of the value to get
 * @param defaultValue The default value to return if the key is not found
 * @returns The value or defaultValue if not found
 */ function get(key, defaultValue) {
    const path = storage.prefix + key;
    const data = storage.media[path] // don't use getItem because it's not supported by all browsers or in memory object storage
    ;
    if (data === undefined || data === null || data === '') return defaultValue;
    const result = parseJson(data);
    if (!result.ok) return data; // TODO: wait... what ?!
    return result.value;
}
/**
 * Set a value in the storage
 * @param key The key of the value to set
 * @param data The value to set
 * @returns The given value
 */ function set(key, data) {
    const path = storage.prefix + key;
    const value = typeof data === 'string' ? data : JSON.stringify(data);
    Reflect.set(storage.media, path, value);
    return data;
}
/**
 * Check if storage has a value
 * @param key The key of the value to check
 * @returns true if storage has a value for the given key
 */ function has(key) {
    return get(key) !== undefined;
}
/**
 * Remove a value from the storage
 * @param key The key of the value to remove
 */ function clear(key) {
    const path = storage.prefix + key;
    // oxlint-disable-next-line no-dynamic-delete
    delete storage.media[path];
}
export const storage = {
    clear,
    get,
    has,
    /* c8 ignore next 2 */ // oxlint-disable-next-line no-undef
    media: typeof localStorage === 'undefined' ? {} : localStorage,
    prefix: '',
    set
};

//# sourceMappingURL=storage.js.map