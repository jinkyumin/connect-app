import { View, Text, StyleSheet } from "react-native";
export default function ActivityScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>알림 (Task 8에서 구현)</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF" },
  text: { color: "#999999" },
});
