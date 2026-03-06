import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLocalStorage } from "../../../app/hooks/use-local-storage";

const SHARED_KEY = "shared-test-key";
const COUNTER_KEY = "counter-test-key";
const SETTINGS_KEY = "settings-test-key";

describe("useLocalStorage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.removeItem(SHARED_KEY);
    window.localStorage.removeItem(COUNTER_KEY);
    window.localStorage.removeItem(SETTINGS_KEY);
  });

  it("hydrates from an existing storage snapshot", async () => {
    window.localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({
        enabled: true,
        theme: "dark",
      }),
    );

    const { result } = renderHook(() =>
      useLocalStorage(SETTINGS_KEY, {
        enabled: false,
        theme: "light",
      }),
    );

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });

    expect(result.current[0]).toEqual({
      enabled: true,
      theme: "dark",
    });
  });

  it("falls back to the default value when stored data is not valid JSON", async () => {
    window.localStorage.setItem(SETTINGS_KEY, "{invalid-json");

    const { result } = renderHook(() =>
      useLocalStorage(SETTINGS_KEY, {
        enabled: false,
        theme: "light",
      }),
    );

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });

    expect(result.current[0]).toEqual({
      enabled: false,
      theme: "light",
    });
  });

  it("syncs same-runtime hook instances through the shared subscriber registry", async () => {
    const firstHook = renderHook(() => useLocalStorage(SHARED_KEY, 0));
    const secondHook = renderHook(() => useLocalStorage(SHARED_KEY, 0));

    await waitFor(() => {
      expect(firstHook.result.current[2]).toBe(true);
      expect(secondHook.result.current[2]).toBe(true);
    });

    act(() => {
      firstHook.result.current[1](3);
    });

    expect(firstHook.result.current[0]).toBe(3);
    expect(secondHook.result.current[0]).toBe(3);
  });

  it("supports functional updates against the latest in-memory value", async () => {
    const { result } = renderHook(() => useLocalStorage(COUNTER_KEY, 0));

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });

    act(() => {
      result.current[1]((previousValue) => previousValue + 1);
      result.current[1]((previousValue) => previousValue + 1);
    });

    expect(result.current[0]).toBe(2);
    expect(window.localStorage.getItem(COUNTER_KEY)).toBe("2");
  });

  it("ignores redundant writes for the same serialized snapshot", async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
    const { result } = renderHook(() => useLocalStorage(COUNTER_KEY, 0));

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });

    act(() => {
      result.current[1](1);
      result.current[1](1);
    });

    expect(setItemSpy).toHaveBeenCalledTimes(1);
    expect(result.current[0]).toBe(1);
  });
});
