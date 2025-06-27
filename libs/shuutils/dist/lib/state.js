/**
 * Creates a state object that can be watched for changes, and optionally sync in a storage object
 * @param data The initial state object
 * @param stateStorage The storage object to sync with
 * @param onlyStoreKeys The keys to sync with the storage object, if empty all keys will be synced
 * @returns The state object and a watch function
 */ // oxlint-disable-next-line max-lines-per-function
export function createState(data, stateStorage, onlyStoreKeys = []) {
    const useStorage = (key)=>stateStorage !== undefined && (onlyStoreKeys.length === 0 || onlyStoreKeys.includes(key));
    const listeners = {};
    const handler = {
        get (target, key) {
            const localValue = Reflect.get(target, key);
            if (useStorage(key)) return stateStorage == null ? void 0 : stateStorage.get(key.toString(), localValue);
            return localValue;
        },
        set (target, key, value) {
            Reflect.set(target, key, value);
            if (useStorage(key)) stateStorage == null ? void 0 : stateStorage.set(key.toString(), value);
            var _listeners_key;
            const callbacks = (_listeners_key = listeners[key]) != null ? _listeners_key : [];
            for (const callback of callbacks)callback(key.toString(), value);
            return true;
        }
    };
    const state = new Proxy(data, handler);
    // oxlint-disable-next-line require-param
    function watchState(key, callback) {
        const all = Object.keys(state);
        const some = Array.isArray(key) ? key : [
            key
        ];
        const keys = key === '*' ? all : some;
        for (const stateKey of keys){
            const list = listeners[stateKey];
            if (list === undefined) listeners[stateKey] = [
                callback
            ];
            else list.push(callback);
        }
    }
    return {
        state,
        watchState
    };
}

//# sourceMappingURL=state.js.map