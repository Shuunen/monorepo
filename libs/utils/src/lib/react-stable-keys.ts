import type { useRef as useRefType } from "react";

/**
 * This is a hook to help you have stable keys for rerender when you don't have access to a key.
 * This should only be used if the array can change during runtime.
 * You needs to keep you array sync with the addKey and removeKey methods
 *
 * @param useRef the useRef function from react, passed dynamically to avoid hard dependency
 * @param length the length of the array to sync with
 * @returns an object containing the keys to use and a remove and add key method
 */
export function useStableKeys(useRef: typeof useRefType, length = 0) {
  const counterRef = useRef(0);
  const keysRef = useRef<number[]>([]);
  const addKey = () => {
    keysRef.current.push(counterRef.current);
    counterRef.current += 1;
  };
  while (keysRef.current.length < length) {
    addKey();
  }
  if (keysRef.current.length > length) {
    keysRef.current.length = length;
  }
  return {
    addKey,
    keys: keysRef.current,
    removeKey: (index: number): void => {
      keysRef.current.splice(index, 1);
    },
  };
}
