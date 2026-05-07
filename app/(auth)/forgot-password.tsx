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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.inner}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>비밀번호 설정</Text>

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

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleReset}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "전송 중..." : "재설정 링크 보내기"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  back: {
    marginBottom: 24,
  },
  backText: {
    fontSize: 24,
    color: "#171D1B",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2E2E2E",
    marginBottom: 32,
  },
  input: {
    height: 48,
    backgroundColor: "#EFEFEF",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#2E2E2E",
  },
  submitButton: {
    height: 48,
    backgroundColor: "#171D1B",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
