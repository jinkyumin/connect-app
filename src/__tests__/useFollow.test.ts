import { renderHook, act } from "@testing-library/react-native";

jest.mock("../lib/supabase", () => ({
  supabase: {
    auth: { getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: "me" } } }, error: null }) },
    from: jest.fn().mockReturnValue({
      insert: jest.fn().mockReturnValue({ error: null }),
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({ error: null }),
        }),
      }),
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({ data: null, error: null }),
        }),
      }),
    }),
  },
}));

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn().mockImplementation(({ mutationFn }) => ({
    mutate: jest.fn(),
    mutateAsync: mutationFn,
    isPending: false,
  })),
  useQueryClient: jest.fn().mockReturnValue({
    invalidateQueries: jest.fn(),
  }),
}));

import { useFollow, useUnfollow } from "../hooks/useFollow";

describe("useFollow", () => {
  it("returns mutate function", () => {
    const { result } = renderHook(() => useFollow());
    expect(typeof result.current.mutate).toBe("function");
  });
});

describe("useUnfollow", () => {
  it("returns mutate function", () => {
    const { result } = renderHook(() => useUnfollow());
    expect(typeof result.current.mutate).toBe("function");
  });
});
