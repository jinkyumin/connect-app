import { View, Image, Text } from "react-native";

interface Props {
  uri?: string | null;
  size?: number;
  initials?: string;
  testID?: string;
}

export function Avatar({ uri, size = 36, initials, testID }: Props) {
  const style = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: "#EFEFEF",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    overflow: "hidden" as const,
  };

  if (uri) {
    return (
      <View style={style}>
        <Image
          source={{ uri }}
          style={{ width: size, height: size }}
          testID={testID}
        />
      </View>
    );
  }

  return (
    <View style={style}>
      <Text style={{ color: "#999999", fontSize: size * 0.35, fontWeight: "600" }}>
        {initials ?? "?"}
      </Text>
    </View>
  );
}
