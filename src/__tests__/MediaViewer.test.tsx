import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { MediaViewer } from "../components/post/MediaViewer";

describe("MediaViewer", () => {
  it("renders image", () => {
    const { getByTestId } = render(
      <MediaViewer
        visible={true}
        uris={["https://example.com/img.jpg"]}
        initialIndex={0}
        onClose={jest.fn()}
      />
    );
    expect(getByTestId("media-viewer")).toBeTruthy();
  });

  it("calls onClose when close button pressed", () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <MediaViewer
        visible={true}
        uris={["https://example.com/img.jpg"]}
        initialIndex={0}
        onClose={onClose}
      />
    );
    fireEvent.press(getByTestId("close-button"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not render when not visible", () => {
    const { queryByTestId } = render(
      <MediaViewer
        visible={false}
        uris={["https://example.com/img.jpg"]}
        initialIndex={0}
        onClose={jest.fn()}
      />
    );
    expect(queryByTestId("media-viewer")).toBeNull();
  });
});
