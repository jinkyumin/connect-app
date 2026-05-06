import { act, renderHook } from "@testing-library/react-native";

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn().mockResolvedValue(null),
  getItem: jest.fn().mockResolvedValue(null),
}));

import { useUiStore } from "../stores/ui.store";

describe("useUiStore", () => {
  it("starts with isDark = false", () => {
    const { result } = renderHook(() => useUiStore());
    expect(result.current.isDark).toBe(false);
  });

  it("toggleDark flips isDark", () => {
    const { result } = renderHook(() => useUiStore());
    act(() => { result.current.toggleDark(); });
    expect(result.current.isDark).toBe(true);
  });

  it("setDark sets exact value", () => {
    const { result } = renderHook(() => useUiStore());
    act(() => { result.current.setDark(true); });
    expect(result.current.isDark).toBe(true);
    act(() => { result.current.setDark(false); });
    expect(result.current.isDark).toBe(false);
  });
});
