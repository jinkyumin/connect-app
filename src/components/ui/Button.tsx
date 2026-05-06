import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";

interface Props {
  label: string;
  onPress: () => void;
  variant?: "primary" | "outline" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  loading,
  disabled,
  fullWidth,
}: Props) {
  const baseStyle = {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    flexDirection: "row" as const,
    ...(fullWidth && { width: "100%" as const }),
  };

  const variantStyle = {
    primary: { backgroundColor: "#171D1B" },
    outline: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#E0E0E0" },
    ghost: { backgroundColor: "transparent" },
  }[variant];

  const textStyle = {
    primary: { color: "#FFFFFF", fontWeight: "700" as const, fontSize: 14 },
    outline: { color: "#2E2E2E", fontWeight: "700" as const, fontSize: 14 },
    ghost: { color: "#2E2E2E", fontWeight: "400" as const, fontSize: 14 },
  }[variant];

  return (
    <TouchableOpacity
      style={[baseStyle, variantStyle, (disabled || loading) && { opacity: 0.5 }]}
      onPress={disabled || loading ? undefined : onPress}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === "primary" ? "#FFF" : "#171D1B"} />
      ) : (
        <Text style={textStyle}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
