import * as Notifications from "expo-notifications";
import { supabase } from "./supabase";

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function registerPushToken(userId: string): Promise<void> {
  const token = await Notifications.getExpoPushTokenAsync();
  const { error } = await supabase
    .from("profiles")
    .update({ push_token: token.data })
    .eq("id", userId);
  if (error) throw error;
}
