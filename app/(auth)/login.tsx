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
import { Button } from "@/components/ui/Button";

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
        <Text style={styles.logo}>Connect</Text>
        <Text style={styles.subtitle}>아성다이소 내부 커뮤니티</Text>

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

        <Button
          label={loading ? "로그인 중..." : "로그인"}
          onPress={handleLogin}
          loading={loading}
          fullWidth
        />

        <TouchableOpacity
          style={styles.link}
          onPress={() => router.push("/(auth)/forgot-password")}
        >
          <Text style={styles.linkText}>비밀번호를 잊으셨나요?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.link}
          onPress={() => router.push("/(auth)/register")}
        >
          <Text style={styles.linkText}>계정이 없으신가요? 회원가입</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  inner: { flex: 1, justifyContent: "center", paddingHorizontal: 24, gap: 12 },
  logo: { fontSize: 32, fontWeight: "700", color: "#171D1B", textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#999999", textAlign: "center", marginBottom: 24 },
  input: {
    backgroundColor: "#EFEFEF",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#2E2E2E",
  },
  link: { alignItems: "center", marginTop: 8 },
  linkText: { color: "#999999", fontSize: 14 },
});
