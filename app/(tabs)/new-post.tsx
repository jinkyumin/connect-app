import { View, Text, StyleSheet } from "react-native";
export default function NewPostScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>글쓰기 (Task 6에서 구현)</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF" },
  text: { color: "#999999" },
});
