import { View } from "react-native";

interface Props {
  name: string;
  size?: number;
  color?: string;
}

// Placeholder SVG icon wrapper - replace with actual SVG icons in Task 5+
export function Icon({ name, size = 24, color = "#2E2E2E" }: Props) {
  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        opacity: 0.1,
        borderRadius: 4,
      }}
      accessibilityLabel={name}
    />
  );
}
