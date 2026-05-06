import { View, Text, StyleSheet } from "react-native";
export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>내 프로필 (Task 7에서 구현)</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF" },
  text: { color: "#999999" },
});
