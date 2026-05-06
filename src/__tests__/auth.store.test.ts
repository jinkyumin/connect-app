import { act, renderHook } from "@testing-library/react-native";
import { useAuthStore } from "../stores/auth.store";

// Mock supabase
jest.mock("../lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
  },
}));

describe("useAuthStore", () => {
  it("starts with null session", () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.session).toBeNull();
  });

  it("setSession updates session state", () => {
    const { result } = renderHook(() => useAuthStore());
    const mockSession = { user: { id: "123", email: "test@example.com" } } as any;
    act(() => {
      result.current.setSession(mockSession);
    });
    expect(result.current.session).toEqual(mockSession);
  });

  it("clearSession nullifies session", () => {
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.clearSession();
    });
    expect(result.current.session).toBeNull();
  });

  it("initialize sets loading to false", async () => {
    const { result } = renderHook(() => useAuthStore());
    await act(async () => {
      await result.current.initialize();
    });
    expect(result.current.loading).toBe(false);
  });
});
