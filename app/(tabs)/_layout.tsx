import { Tabs } from "expo-router";
import { Text, StyleSheet } from "react-native";

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  home:    { active: "⌂",  inactive: "⌂"  },
  search:  { active: "⌕",  inactive: "⌕"  },
  newpost: { active: "✎",  inactive: "✎"  },
  activity:{ active: "🔔", inactive: "🔔" },
  profile: { active: "◉",  inactive: "◯"  },
};

function TabIcon({ focused, name }: { focused: boolean; name: keyof typeof TAB_ICONS }) {
  const icon = TAB_ICONS[name];
  return (
    <Text style={[styles.icon, focused ? styles.iconActive : styles.iconInactive]}>
      {focused ? icon.active : icon.inactive}
    </Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#F5F5F5",
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#171D1B",
        tabBarInactiveTintColor: "#999999",
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="home" />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "검색",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="search" />,
        }}
      />
      <Tabs.Screen
        name="new-post"
        options={{
          title: "새 글",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="newpost" />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "알림",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="activity" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "프로필",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} name="profile" />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: { fontSize: 22 },
  iconActive: { color: "#171D1B" },
  iconInactive: { color: "#999999", opacity: 0.5 },
});
