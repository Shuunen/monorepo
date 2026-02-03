import type { ShuutilsStorage } from "./storage.js";

type StateCallback = (() => void) | ((updatedKey: string, updatedValue?: unknown) => void);

/**
 * Creates a state object that can be watched for changes, and optionally sync in a storage object
 * @param data The initial state object
 * @param stateStorage The storage object to sync with
 * @param onlyStoreKeys The keys to sync with the storage object, if empty all keys will be synced
 * @returns The state object and a watch function
 */
// oxlint-disable-next-line max-lines-per-function
export function createState<State extends object>(
  data: State,
  stateStorage?: ShuutilsStorage,
  onlyStoreKeys: Array<keyof State> = [],
) {
  type StateKey = keyof State;
  const useStorage = (key: string | symbol) =>
    stateStorage !== undefined && (onlyStoreKeys.length === 0 || onlyStoreKeys.includes(key as StateKey));
  const listeners: Partial<Record<StateKey, StateCallback[]>> = {};
  const handler: ProxyHandler<State> = {
    get(target: State, key: string | symbol) {
      const localValue: State[StateKey] = Reflect.get(target, key);
      if (useStorage(key)) {
        return stateStorage?.get(key.toString(), localValue);
      }
      return localValue;
    },
    set(target: State, key: string | symbol, value: unknown) {
      Reflect.set(target, key, value);
      if (useStorage(key)) {
        stateStorage?.set(key.toString(), value);
      }
      const callbacks = listeners[key as StateKey] ?? [];
      for (const callback of callbacks) {
        callback(key.toString(), value);
      }
      return true;
    },
  };
  const state = new Proxy<State>(data, handler);
  // oxlint-disable-next-line require-param
  function watchState(key: "*" | StateKey | StateKey[], callback: StateCallback) {
    const all = Object.keys(state) as StateKey[];
    const some = Array.isArray(key) ? key : [key as StateKey];
    const keys = key === "*" ? all : some;
    for (const stateKey of keys) {
      const list = listeners[stateKey];
      if (list === undefined) {
        listeners[stateKey] = [callback];
      } else {
        list.push(callback);
      }
    }
  }
  return { state, watchState };
}
