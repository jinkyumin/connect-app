import { registerPushToken } from "../lib/notifications";

const mockUpdate = jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) });

jest.mock("../lib/supabase", () => ({
  supabase: {
    from: jest.fn(() => ({
      update: mockUpdate,
    })),
  },
}));

jest.mock("expo-notifications", () => ({
  getExpoPushTokenAsync: jest.fn().mockResolvedValue({ data: "ExponentPushToken[test]" }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
}));

describe("registerPushToken", () => {
  it("calls supabase update with push_token for the given userId", async () => {
    await registerPushToken("user-123");

    expect(mockUpdate).toHaveBeenCalledWith({ push_token: "ExponentPushToken[test]" });
  });
});
