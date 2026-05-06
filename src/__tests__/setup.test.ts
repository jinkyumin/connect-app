import tailwindConfig from "../../tailwind.config";

describe("Design tokens", () => {
  it("has correct brand color", () => {
    expect(tailwindConfig.theme.extend.colors.brand).toBe("#171D1B");
  });

  it("has correct accent color", () => {
    expect(tailwindConfig.theme.extend.colors.accent).toBe("#1AB64A");
  });

  it("has dark mode colors", () => {
    expect(tailwindConfig.theme.extend.colors.dark.DEFAULT).toBe("#0E0E0E");
    expect(tailwindConfig.theme.extend.colors.dark.card).toBe("#1F1F1F");
  });
});
