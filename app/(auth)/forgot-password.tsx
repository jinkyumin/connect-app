import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) Alert.alert("오류", error.message);
    else Alert.alert("이메일 발송", "비밀번호 재설정 링크를 보냈습니다.", [
      { text: "확인", onPress: () => router.back() },
    ]);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>비밀번호 재설정</Text>
        <Text style={styles.desc}>가입한 이메일 주소를 입력하시면 재설정 링크를 보내드립니다.</Text>

        <TextInput
          style={styles.input}
          placeholder="이메일"
          placeholderTextColor="#999999"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          testID="email-input"
        />

        <Button label="링크 보내기" onPress={handleReset} loading={loading} fullWidth />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF", paddingHorizontal: 24, paddingTop: 60 },
  back: { marginBottom: 24 },
  backText: { color: "#999999", fontSize: 14 },
  title: { fontSize: 28, fontWeight: "700", color: "#2E2E2E", marginBottom: 12 },
  desc: { fontSize: 14, color: "#999999", marginBottom: 24, lineHeight: 20 },
  input: {
    backgroundColor: "#EFEFEF",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#2E2E2E",
    marginBottom: 12,
  },
});
