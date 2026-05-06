import React from "react";
import { render } from "@testing-library/react-native";
import { OgPreview } from "../components/post/OgPreview";

describe("OgPreview", () => {
  it("renders OG title and URL", () => {
    const { getByText } = render(
      <OgPreview
        url="https://example.com"
        title="Example Site"
        imageUrl={null}
      />
    );
    expect(getByText("Example Site")).toBeTruthy();
  });

  it("renders URL fallback when no title", () => {
    const { getByText } = render(
      <OgPreview
        url="https://example.com"
        title={null}
        imageUrl={null}
      />
    );
    expect(getByText("https://example.com")).toBeTruthy();
  });
});
