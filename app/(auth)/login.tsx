import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert("로그인 실패", error.message);
    else router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.logo}>사내 Connect</Text>
        <Text style={styles.subtitle}>아성다이소 IT팀 소통 플랫폼</Text>

        <View style={styles.inputGroup}>
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
          <TextInput
            style={styles.input}
            placeholder="비밀번호"
            placeholderTextColor="#999999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            testID="password-input"
          />
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? "로그인 중..." : "로그인"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => router.push("/(auth)/forgot-password")}
        >
          <Text style={styles.linkMuted}>비밀번호를 잊으셨나요?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => router.push("/(auth)/register")}
        >
          <Text style={styles.linkMuted}>
            계정이 없으신가요?{" "}
            <Text style={styles.linkBold}>회원가입</Text>
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
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logo: {
    fontSize: 28,
    fontWeight: "700",
    color: "#171D1B",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#999999",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 48,
  },
  inputGroup: {
    gap: 12,
  },
  input: {
    height: 48,
    backgroundColor: "#EFEFEF",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#2E2E2E",
  },
  loginButton: {
    height: 48,
    backgroundColor: "#171D1B",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  linkRow: {
    alignItems: "center",
    marginTop: 16,
  },
  linkMuted: {
    fontSize: 14,
    color: "#999999",
  },
  linkBold: {
    fontSize: 14,
    color: "#171D1B",
    fontWeight: "700",
  },
});
