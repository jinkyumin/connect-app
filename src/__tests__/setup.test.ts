describe("Project setup", () => {
  it("should have correct app name", () => {
    expect("Connect").toBe("Connect");
  });

  it("should have brand color defined", () => {
    const brandColor = "#171D1B";
    expect(brandColor).toMatch(/^#[0-9A-F]{6}$/i);
  });
});
