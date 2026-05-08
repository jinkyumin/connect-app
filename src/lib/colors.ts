export const LIGHT = {
  bg: "#FFFFFF",
  card: "#FFFFFF",
  text: "#2E2E2E",
  muted: "#999999",
  border: "#F5F5F5",
  input: "#EFEFEF",
  brand: "#171D1B",
  accent: "#1AB64A",
  danger: "#FF3B30",
  tabBar: "#FFFFFF",
  header: "#FFFFFF",
};

export const DARK = {
  bg: "#0E0E0E",
  card: "#1F1F1F",
  text: "#F0F0F0",
  muted: "#666666",
  border: "#2A2A2A",
  input: "#2A2A2A",
  brand: "#FFFFFF",
  accent: "#1AB64A",
  danger: "#FF3B30",
  tabBar: "#0E0E0E",
  header: "#0E0E0E",
};

export type Colors = typeof LIGHT;

export function useColors(): Colors {
  const isDark = require("../stores/ui.store").useUiStore((s: any) => s.isDark);
  return isDark ? DARK : LIGHT;
}
