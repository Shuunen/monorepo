import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { useStableKeys } from "./react-stable-keys.js";
import { act, renderHook } from "@testing-library/react";
import { useRef } from "react";

if (!GlobalRegistrator.isRegistered) {
  GlobalRegistrator.register();
}

describe(useStableKeys, () => {
  it("useStableKeys A should generate key based on length", () => {
    const { result } = renderHook(() => useStableKeys(useRef, 3));
    expect(result.current.keys).toEqual([0, 1, 2]);
  });

  it("useStableKeys B should generate empty array for length 0", () => {
    const { result } = renderHook(() => useStableKeys(useRef));
    expect(result.current.keys).toEqual([]);
  });

  it("useStableKeys C should add a key when addKey is called", () => {
    const { result } = renderHook(() => useStableKeys(useRef, 2));
    expect(result.current.keys).toEqual([0, 1]);

    act(() => {
      result.current.addKey();
    });

    expect(result.current.keys).toEqual([0, 1, 2]);
  });
  it("useStableKeys D should remove a key when removeKey is called", () => {
    const { result } = renderHook(() => useStableKeys(useRef, 3));
    expect(result.current.keys).toEqual([0, 1, 2]);

    act(() => {
      result.current.removeKey(1);
    });

    expect(result.current.keys).toEqual([0, 2]);
  });
  it("useStableKeys E should maintain stable keys across re-renders", () => {
    const { result, rerender } = renderHook(({ length }) => useStableKeys(useRef, length), {
      initialProps: { length: 2 },
    });
    expect(result.current.keys).toEqual([0, 1]);

    rerender({ length: 2 });

    expect(result.current.keys).toEqual([0, 1]);
  });
  it("useStableKeys F should add new key when length increase", () => {
    const { result, rerender } = renderHook(({ length }) => useStableKeys(useRef, length), {
      initialProps: { length: 3 },
    });
    expect(result.current.keys).toEqual([0, 1, 2]);

    rerender({ length: 4 });

    expect(result.current.keys).toEqual([0, 1, 2, 3]);
  });
  it("useStableKeys G should delete new key when length decrease", () => {
    const { result, rerender } = renderHook(({ length }) => useStableKeys(useRef, length), {
      initialProps: { length: 3 },
    });
    expect(result.current.keys).toEqual([0, 1, 2]);

    rerender({ length: 1 });

    expect(result.current.keys).toEqual([0]);
  });
  it("useStableKeys H should preserve existing key when length increases", () => {
    const { result, rerender } = renderHook(({ length }) => useStableKeys(useRef, length), {
      initialProps: { length: 3 },
    });
    expect(result.current.keys).toEqual([0, 1, 2]);

    act(() => {
      result.current.removeKey(1);
    });
    rerender({ length: 3 });

    expect(result.current.keys).toEqual([0, 2, 3]);
  });
  it("useStableKeys I should generate unique keys even after multiple add/removes cycles", () => {
    const { result } = renderHook(() => useStableKeys(useRef, 1));
    expect(result.current.keys).toEqual([0]);

    act(() => {
      result.current.addKey();
      result.current.addKey();
    });

    expect(result.current.keys).toEqual([0, 1, 2]);

    act(() => {
      result.current.removeKey(0);
      result.current.removeKey(0);
    });

    expect(result.current.keys).toEqual([2]);

    act(() => {
      result.current.addKey();
      result.current.addKey();
    });

    expect(result.current.keys).toEqual([2, 3, 4]);
  });
});
