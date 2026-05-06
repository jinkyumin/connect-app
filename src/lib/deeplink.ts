import { Linking } from "react-native";
import { router } from "expo-router";

export function handleDeepLink(url: string): void {
  try {
    const { path } = Linking.parse(url);
    if (!path) return;

    if (path.startsWith("post/")) {
      router.push(`/post/${path.replace("post/", "")}`);
    } else if (path.startsWith("profile/")) {
      router.push(`/profile/${path.replace("profile/", "")}`);
    } else if (path.startsWith("hashtag/")) {
      router.push(`/hashtag/${path.replace("hashtag/", "")}`);
    }
  } catch {
    // ignore invalid URLs
  }
}

export function setupDeepLinkListener(): () => void {
  const subscription = Linking.addEventListener("url", ({ url }) => {
    handleDeepLink(url);
  });
  return () => subscription.remove();
}
