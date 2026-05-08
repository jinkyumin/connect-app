import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useUiStore } from "@/stores/ui.store";

function HomeIcon({ focused }: { focused: boolean }) {
  const isDark = useUiStore((s) => s.isDark);
  const activeColor = isDark ? "#FFFFFF" : "#171D1B";
  return focused
    ? <Ionicons name="home" size={24} color={activeColor} />
    : <Ionicons name="home-outline" size={24} color="#999999" />;
}

function SearchIcon({ focused }: { focused: boolean }) {
  const isDark = useUiStore((s) => s.isDark);
  const activeColor = isDark ? "#FFFFFF" : "#171D1B";
  return <Feather name="search" size={22} color={focused ? activeColor : "#999999"} />;
}

function NewPostIcon({ focused }: { focused: boolean }) {
  return (
    <View style={[styles.newPostBtn, focused && styles.newPostBtnActive]}>
      <Feather name="plus" size={22} color={focused ? "#171D1B" : "#555555"} />
    </View>
  );
}

function ActivityIcon({ focused }: { focused: boolean }) {
  const isDark = useUiStore((s) => s.isDark);
  const activeColor = isDark ? "#FFFFFF" : "#171D1B";
  return focused
    ? <Ionicons name="heart" size={24} color={activeColor} />
    : <Ionicons name="heart-outline" size={24} color="#999999" />;
}

function ProfileIcon({ focused }: { focused: boolean }) {
  const isDark = useUiStore((s) => s.isDark);
  const activeColor = isDark ? "#FFFFFF" : "#171D1B";
  return focused
    ? <Ionicons name="person" size={24} color={activeColor} />
    : <Ionicons name="person-outline" size={24} color="#999999" />;
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const isDark = useUiStore((s) => s.isDark);
  const tabBg = isDark ? "#0E0E0E" : "#FFFFFF";
  const tabBorder = isDark ? "#2A2A2A" : "#F5F5F5";
  const activeColor = isDark ? "#FFFFFF" : "#171D1B";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: tabBg,
          borderTopWidth: 1,
          borderTopColor: tabBorder,
          height: 52 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
        },
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: "#999999",
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarIcon: ({ focused }) => <HomeIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "검색",
          tabBarIcon: ({ focused }) => <SearchIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="new-post"
        options={{
          title: "새 글",
          tabBarIcon: ({ focused }) => <NewPostIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "알림",
          tabBarIcon: ({ focused }) => <ActivityIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "프로필",
          tabBarIcon: ({ focused }) => <ProfileIcon focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "메시지",
          tabBarButton: () => null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  newPostBtn: {
    width: 44,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  newPostBtnActive: {
    backgroundColor: "#E8E8E8",
  },
});
