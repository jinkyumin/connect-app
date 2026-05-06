import React from "react";
import { render } from "@testing-library/react-native";

// Mock the hooks
jest.mock("../hooks/useNotifications", () => ({
  useNotifications: () => ({ data: [], isLoading: false }),
}));
jest.mock("../stores/auth.store", () => ({
  useAuthStore: (selector: (s: { session: null }) => unknown) => selector({ session: null }),
}));

// Mock expo-router
jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
}));

import ActivityScreen from "../../app/(tabs)/activity";

describe("ActivityScreen", () => {
  it("renders empty state when no notifications", () => {
    const { getByText } = render(<ActivityScreen />);
    expect(getByText("아직 알림이 없습니다.")).toBeTruthy();
  });
});
