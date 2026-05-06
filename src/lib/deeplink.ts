import { Linking } from "react-native";
import { router } from "expo-router";

export function handleDeepLink(url: string): void {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname;

    if (path.startsWith("/post/")) {
      const id = path.replace("/post/", "");
      router.push(`/post/${id}`);
    } else if (path.startsWith("/profile/")) {
      const username = path.replace("/profile/", "");
      router.push(`/profile/${username}`);
    } else if (path.startsWith("/hashtag/")) {
      const tag = path.replace("/hashtag/", "");
      router.push(`/hashtag/${tag}`);
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
