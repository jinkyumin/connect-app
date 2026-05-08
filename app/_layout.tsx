import { useEffect } from "react";
import { Stack, router } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/auth.store";
import { setupDeepLinkListener } from "@/lib/deeplink";
import "../global.css";

const queryClient = new QueryClient();

function AppContent() {
  const { initialize, session, loading } = useAuthStore();

  useEffect(() => { initialize(); }, [initialize]);

  useEffect(() => {
    if (loading) return;
    if (session) {
      router.replace("/(tabs)");
    } else {
      router.replace("/(auth)/login");
    }
  }, [session, loading]);

  useEffect(() => {
    return setupDeepLinkListener();
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <AppContent />
        </QueryClientProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
