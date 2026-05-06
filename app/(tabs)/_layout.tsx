import { Tabs } from "expo-router";
import { Text } from "react-native";

function TabIcon({ focused, label }: { focused: boolean; label: string }) {
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>{label}</Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#EFEFEF",
          height: 60,
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
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="🏠" />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "검색",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="🔍" />,
        }}
      />
      <Tabs.Screen
        name="new-post"
        options={{
          title: "새 글",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="✏️" />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "알림",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="🔔" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "프로필",
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="👤" />,
        }}
      />
    </Tabs>
  );
}
