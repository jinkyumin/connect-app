import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Button } from "../components/ui/Button";

describe("Button", () => {
  it("renders primary variant with label", () => {
    const { getByText } = render(
      <Button label="확인" onPress={() => {}} />
    );
    expect(getByText("확인")).toBeTruthy();
  });

  it("calls onPress when tapped", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button label="탭" onPress={onPress} />
    );
    fireEvent.press(getByText("탭"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Button label="비활성" onPress={onPress} disabled />
    );
    fireEvent.press(getByText("비활성"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("renders outline variant", () => {
    const { getByText } = render(
      <Button label="아웃라인" onPress={() => {}} variant="outline" />
    );
    expect(getByText("아웃라인")).toBeTruthy();
  });
});
