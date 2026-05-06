import easConfig from "../../eas.json";

describe("EAS config", () => {
  it("has development, preview, and production build profiles", () => {
    expect(easConfig.build.development).toBeDefined();
    expect(easConfig.build.preview).toBeDefined();
    expect(easConfig.build.production).toBeDefined();
  });

  it("development profile uses internal distribution", () => {
    expect(easConfig.build.development.distribution).toBe("internal");
  });

  it("production profile uses store distribution", () => {
    expect(easConfig.build.production.distribution).toBe("store");
  });
});
