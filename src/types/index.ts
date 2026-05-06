export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  website_url: string | null;
  is_private: boolean;
  is_admin: boolean;
  created_at: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  is_following?: boolean;
  is_followed_by?: boolean;
  follow_status?: "pending" | "accepted" | null;
}

export interface Post {
  id: string;
  user_id: string;
  content: string | null;
  media_urls: string[];
  media_types: string[];
  og_url: string | null;
  og_title: string | null;
  og_image: string | null;
  parent_id: string | null;
  quote_post_id: string | null;
  is_pinned: boolean;
  edited_at: string | null;
  created_at: string;
  profile?: Profile;
  likes_count?: number;
  comments_count?: number;
  reposts_count?: number;
  is_liked?: boolean;
  is_reposted?: boolean;
  is_bookmarked?: boolean;
  quote_post?: Post;
  replies?: Post[];
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string | null;
  media_url: string | null;
  read_at: string | null;
  created_at: string;
  sender?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string;
  type: "like" | "comment" | "follow" | "follow_request" | "repost" | "mention" | "quote";
  post_id: string | null;
  read_at: string | null;
  created_at: string;
  actor?: Profile;
  post?: Post;
}

export interface Draft {
  id: string;
  user_id: string;
  content: string | null;
  media_uris: string[];
  parent_id: string | null;
  updated_at: string;
}

export interface Conversation {
  partner: Profile;
  last_message: Message | null;
  unread_count: number;
}
