import React from "react";
import { render } from "@testing-library/react-native";
import { Avatar } from "../components/ui/Avatar";

describe("Avatar", () => {
  it("renders with image source", () => {
    const { getByTestId } = render(
      <Avatar uri="https://example.com/avatar.jpg" size={40} testID="avatar-img" />
    );
    expect(getByTestId("avatar-img")).toBeTruthy();
  });

  it("renders initials fallback when no uri", () => {
    const { getByText } = render(
      <Avatar size={40} initials="JK" />
    );
    expect(getByText("JK")).toBeTruthy();
  });
});
