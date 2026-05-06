import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View style={styles.container}>
      <Text style={styles.text}>게시물 상세: {id}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF" },
  text: { color: "#999999" },
});
