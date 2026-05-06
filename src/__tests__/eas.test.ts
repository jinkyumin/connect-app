import easConfig from "../../eas.json";

describe("EAS config", () => {
  it("has development, preview, and production build profiles", () => {
    expect(easConfig.build.development).toBeDefined();
    expect(easConfig.build.preview).toBeDefined();
    expect(easConfig.build.production).toBeDefined();
  });

  it("development profile uses internal distribution and correct build types", () => {
    expect(easConfig.build.development.distribution).toBe("internal");
    expect(easConfig.build.development.android.buildType).toBe("apk");
    expect(easConfig.build.development.ios.simulator).toBe(true);
  });

  it("preview profile uses internal distribution with apk", () => {
    expect(easConfig.build.preview.distribution).toBe("internal");
    expect(easConfig.build.preview.android.buildType).toBe("apk");
  });

  it("production profile uses store distribution with app-bundle", () => {
    expect(easConfig.build.production.distribution).toBe("store");
    expect(easConfig.build.production.android.buildType).toBe("app-bundle");
  });
});
