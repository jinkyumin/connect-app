import { View, Text, Image, TouchableOpacity, StyleSheet, Linking } from "react-native";

interface Props {
  url: string;
  title?: string | null;
  imageUrl?: string | null;
}

export function OgPreview({ url, title, imageUrl }: Props) {
  const domain = (() => {
    try { return new URL(url).hostname; } catch { return url; }
  })();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => Linking.openURL(url)}
      activeOpacity={0.8}
    >
      {imageUrl && (
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      )}
      <View style={styles.textArea}>
        <Text style={styles.domain}>{domain}</Text>
        <Text style={styles.title} numberOfLines={2}>{title ?? url}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EFEFEF",
    overflow: "hidden",
    marginTop: 8,
  },
  image: { width: "100%", height: 160 },
  textArea: { padding: 12, gap: 2 },
  domain: { fontSize: 12, color: "#999999" },
  title: { fontSize: 14, color: "#2E2E2E", fontWeight: "600" },
});
