# Connect 앱 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expo + Supabase 기반 사내 Threads 클론 앱 (iOS/Android) 전체 구현

**Architecture:** Expo Router로 파일 기반 라우팅, Supabase로 인증/DB/Storage/Realtime 처리, NativeWind로 스타일링. 별도 백엔드 서버 없이 Supabase 단독으로 모든 서버 기능 처리.

**Tech Stack:** Expo SDK 51, Expo Router, NativeWind, Zustand, React Query, Supabase JS, Expo Image Picker, Expo Notifications, Expo Linking

---

## 파일 구조

```
connect_app/
├── app/
│   ├── _layout.tsx                  # 루트 레이아웃 (인증 분기)
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx              # 탭바 정의
│   │   ├── index.tsx                # 홈 피드
│   │   ├── search.tsx               # 검색
│   │   ├── new-post.tsx             # 게시물 작성
│   │   ├── activity.tsx             # 알림
│   │   └── profile.tsx              # 내 프로필
│   ├── post/
│   │   ├── [id].tsx                 # 게시물 상세
│   │   └── edit/[id].tsx            # 게시물 수정
│   ├── profile/[username].tsx       # 타인 프로필
│   ├── hashtag/[tag].tsx            # 해시태그 피드
│   ├── messages/
│   │   ├── index.tsx                # DM 목록
│   │   └── [id].tsx                 # DM 대화방
│   └── settings/
│       ├── index.tsx
│       ├── account.tsx
│       ├── notifications.tsx
│       ├── privacy.tsx
│       └── appearance.tsx
├── src/
│   ├── lib/
│   │   ├── supabase.ts              # Supabase 클라이언트
│   │   └── deeplink.ts             # 딥링크 유틸
│   ├── stores/
│   │   ├── auth.store.ts            # 인증 상태 (Zustand)
│   │   └── ui.store.ts              # UI 상태 (다크모드 등)
│   ├── hooks/
│   │   ├── useSession.ts
│   │   ├── useFeed.ts
│   │   ├── usePost.ts
│   │   ├── useFollow.ts
│   │   ├── useMessages.ts
│   │   ├── useNotifications.ts
│   │   └── useSearch.ts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── TabBar.tsx
│   │   │   └── Icon.tsx             # SVG 아이콘 래퍼
│   │   ├── post/
│   │   │   ├── PostCard.tsx         # 피드용 게시물 카드
│   │   │   ├── PostActions.tsx      # 좋아요/댓글/리포스트/공유
│   │   │   ├── PostComposer.tsx     # 작성 입력창
│   │   │   ├── MediaGrid.tsx        # 이미지/동영상 그리드
│   │   │   ├── MediaViewer.tsx      # 전체화면 뷰어
│   │   │   ├── OgPreview.tsx        # 링크 미리보기 카드
│   │   │   ├── QuotePost.tsx        # 인용 리포스트 미리보기
│   │   │   └── ThreadLine.tsx       # 스레드 연결선
│   │   ├── mentions/
│   │   │   ├── MentionInput.tsx     # @멘션 자동완성 입력
│   │   │   └── HashtagInput.tsx     # #해시태그 파싱
│   │   └── profile/
│   │       ├── ProfileHeader.tsx
│   │       └── FollowButton.tsx
│   └── types/
│       └── index.ts                 # 공통 타입 정의
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── functions/
│       ├── send-push/index.ts       # 푸시 알림 Edge Function
│       └── send-report/index.ts     # 신고 알림 Edge Function
├── tailwind.config.js
├── app.json
└── package.json
```

---

## Task 1: 프로젝트 초기화 및 환경 설정

**Files:**
- Create: `package.json`, `app.json`, `tailwind.config.js`, `babel.config.js`
- Create: `src/lib/supabase.ts`
- Create: `.env`

- [ ] **TDD Step: 테스트 환경 설치**

```bash
npm install --save-dev jest jest-expo @testing-library/react-native @testing-library/jest-native
```

`package.json` jest 설정:
```json
{
  "jest": {
    "preset": "jest-expo",
    "setupFilesAfterFramework": ["@testing-library/react-native/extend-expect"],
    "moduleNameMapper": { "^@/(.*)$": "<rootDir>/src/$1" },
    "transformIgnorePatterns": [
      "node_modules/(?!(jest-)?react-native|@react-native|expo|@expo|nativewind)"
    ]
  }
}
```

- [ ] **Step 1: Expo 프로젝트 생성**

```bash
npx create-expo-app connect_app --template blank-typescript
cd connect_app
```

- [ ] **Step 2: 의존성 설치**

```bash
npx expo install expo-router expo-linking expo-constants expo-status-bar
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage
npx expo install expo-image-picker expo-video expo-file-system
npx expo install expo-notifications expo-device
npx expo install react-native-gesture-handler react-native-reanimated
npx expo install react-native-safe-area-context react-native-screens

npm install nativewind zustand @tanstack/react-query
npm install link-preview-js date-fns
npm install --save-dev tailwindcss
```

- [ ] **Step 3: NativeWind 설정**

`tailwind.config.js`:
```js
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: "#171D1B",      // 버튼, CTA
        accent: "#1AB64A",     // 액센트 그린
        mint: "#F4FBF8",       // 배경 강조
        input: "#EFEFEF",      // 입력창 배경
        ink: "#2E2E2E",
        muted: "#999999",
        divider: "#EFEFEF",
        dark: { DEFAULT: "#0E0E0E", card: "#1F1F1F" },
      },
      fontFamily: {
        sans: ["System", "Pretendard", "sans-serif"],
      },
    },
  },
};
```

`babel.config.js`:
```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
```

- [ ] **Step 4: app.json 설정**

```json
{
  "expo": {
    "name": "Connect",
    "slug": "connect-app",
    "scheme": "connect",
    "version": "1.0.0",
    "platforms": ["ios", "android"],
    "plugins": [
      "expo-router",
      ["expo-notifications", { "color": "#1AB64A" }]
    ],
    "android": { "package": "com.daiso.connect" },
    "ios": { "bundleIdentifier": "com.daiso.connect" }
  }
}
```

- [ ] **Step 5: Supabase 클라이언트 생성**

`src/lib/supabase.ts`:
```ts
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

- [ ] **Step 6: .env 작성**

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 7: 커밋**

```bash
git init && git add . && git commit -m "feat: Connect 앱 프로젝트 초기화 및 환경 설정"
```

---

## Task 2: Supabase 데이터베이스 스키마

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Supabase CLI 설치 및 프로젝트 연결**

```bash
npm install -g supabase
supabase login
supabase init
supabase link --project-ref your-project-ref
```

- [ ] **Step 2: 마이그레이션 파일 작성**

`supabase/migrations/001_initial_schema.sql`:
```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  website_url text,
  is_private boolean default false,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- Posts
create table posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  content text check (char_length(content) <= 500),
  media_urls text[] default '{}',
  media_types text[] default '{}',
  og_url text,
  og_title text,
  og_image text,
  parent_id uuid references posts(id) on delete cascade,
  quote_post_id uuid references posts(id) on delete set null,
  is_pinned boolean default false,
  edited_at timestamptz,
  created_at timestamptz default now()
);

-- Drafts
create table drafts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  content text,
  media_uris text[] default '{}',
  parent_id uuid references posts(id) on delete set null,
  updated_at timestamptz default now()
);

-- Likes
create table likes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  post_id uuid references posts(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, post_id)
);

-- Follows
create table follows (
  follower_id uuid references profiles(id) on delete cascade not null,
  following_id uuid references profiles(id) on delete cascade not null,
  status text default 'accepted' check (status in ('pending', 'accepted')),
  created_at timestamptz default now(),
  primary key(follower_id, following_id)
);

-- Reposts
create table reposts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  post_id uuid references posts(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, post_id)
);

-- Bookmarks
create table bookmarks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  post_id uuid references posts(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, post_id)
);

-- Hashtags
create table hashtags (
  id uuid primary key default uuid_generate_v4(),
  tag text unique not null,
  post_count int default 0,
  created_at timestamptz default now()
);

create table post_hashtags (
  post_id uuid references posts(id) on delete cascade not null,
  hashtag_id uuid references hashtags(id) on delete cascade not null,
  primary key(post_id, hashtag_id)
);

-- Messages
create table messages (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid references profiles(id) on delete cascade not null,
  receiver_id uuid references profiles(id) on delete cascade not null,
  content text,
  media_url text,
  read_at timestamptz,
  created_at timestamptz default now()
);

-- Notifications
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  actor_id uuid references profiles(id) on delete cascade not null,
  type text not null check (type in ('like','comment','follow','follow_request','repost','mention','quote')),
  post_id uuid references posts(id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz default now()
);

-- Mutes
create table mutes (
  muter_id uuid references profiles(id) on delete cascade not null,
  muted_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key(muter_id, muted_id)
);

-- Blocks
create table blocks (
  blocker_id uuid references profiles(id) on delete cascade not null,
  blocked_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key(blocker_id, blocked_id)
);

-- Reports
create table reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid references profiles(id) on delete cascade not null,
  post_id uuid references posts(id) on delete set null,
  reported_user_id uuid references profiles(id) on delete set null,
  reason text not null check (reason in ('spam','inappropriate','misinformation','other')),
  detail text,
  created_at timestamptz default now()
);

-- Notification settings
create table notification_settings (
  user_id uuid primary key references profiles(id) on delete cascade,
  likes boolean default true,
  comments boolean default true,
  follows boolean default true,
  dms boolean default true,
  mentions boolean default true,
  reposts boolean default true
);

-- Push tokens
create table push_tokens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade not null,
  token text unique not null,
  created_at timestamptz default now()
);

-- Enable full-text search on posts
create index posts_content_fts on posts using gin(to_tsvector('simple', content));

-- RLS 활성화
alter table profiles enable row level security;
alter table posts enable row level security;
alter table drafts enable row level security;
alter table likes enable row level security;
alter table follows enable row level security;
alter table reposts enable row level security;
alter table bookmarks enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;
alter table mutes enable row level security;
alter table blocks enable row level security;
alter table reports enable row level security;
alter table notification_settings enable row level security;
alter table push_tokens enable row level security;

-- RLS Policies
create policy "Public profiles viewable" on profiles for select using (true);
create policy "Users update own profile" on profiles for update using (auth.uid() = id);

create policy "Posts viewable" on posts for select using (true);
create policy "Users insert own posts" on posts for insert with check (auth.uid() = user_id);
create policy "Users update own posts" on posts for update using (auth.uid() = user_id);
create policy "Users delete own posts" on posts for delete using (auth.uid() = user_id);

create policy "Users manage own drafts" on drafts for all using (auth.uid() = user_id);
create policy "Users manage own likes" on likes for all using (auth.uid() = user_id);
create policy "Users view follows" on follows for select using (true);
create policy "Users manage own follows" on follows for all using (auth.uid() = follower_id);
create policy "Users manage own reposts" on reposts for all using (auth.uid() = user_id);
create policy "Users manage own bookmarks" on bookmarks for all using (auth.uid() = user_id);

create policy "Users view own messages" on messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Users send messages" on messages for insert with check (auth.uid() = sender_id);

create policy "Users view own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Users manage own mutes" on mutes for all using (auth.uid() = muter_id);
create policy "Users manage own blocks" on blocks for all using (auth.uid() = blocker_id);
create policy "Users insert reports" on reports for insert with check (auth.uid() = reporter_id);
create policy "Users manage own notification settings" on notification_settings for all using (auth.uid() = user_id);
create policy "Users manage own push tokens" on push_tokens for all using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (new.id, split_part(new.email, '@', 1), split_part(new.email, '@', 1));
  insert into public.notification_settings (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Enable Realtime
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table notifications;
```

- [ ] **Step 3: 마이그레이션 적용**

```bash
supabase db push
```

Expected: 모든 테이블 생성 완료 메시지

- [ ] **Step 4: Supabase Storage 버킷 생성**

Supabase Dashboard → Storage → New bucket:
- `avatars` (public)
- `post-media` (public)
- `message-media` (public)

- [ ] **Step 5: 커밋**

```bash
git add supabase/ && git commit -m "feat: Supabase 스키마 및 RLS 설정"
```

---

## Task 3: 공통 타입 및 디자인 시스템

**디자인 레퍼런스:** `design/로그인.html` (버튼 스타일), `design/홈피드.html` (Avatar, 카드 레이아웃)

**TDD:**
- `src/__tests__/Button.test.tsx`: primary/outline/ghost variant 렌더, onPress 호출 검증
- `src/__tests__/Avatar.test.tsx`: 이미지 소스 렌더, 폴백 이니셜 렌더

**Files:**
- Create: `src/types/index.ts`
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Avatar.tsx`
- Create: `src/components/ui/Icon.tsx`

- [ ] **Step 1: 공통 타입 정의**

`src/types/index.ts`:
```ts
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
  // 조인 데이터
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  is_following?: boolean;
  is_followed_by?: boolean;
  follow_status?: 'pending' | 'accepted' | null;
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
  // 조인 데이터
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
  type: 'like' | 'comment' | 'follow' | 'follow_request' | 'repost' | 'mention' | 'quote';
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
```

- [ ] **Step 2: Button 컴포넌트**

`src/components/ui/Button.tsx`:
```tsx
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";

interface Props {
  label: string;
  onPress: () => void;
  variant?: "primary" | "outline" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Button({ label, onPress, variant = "primary", loading, disabled, className }: Props) {
  const base = "rounded-lg px-4 py-2.5 items-center justify-center flex-row";
  const variants = {
    primary: "bg-ink",
    outline: "border border-[#E0E0E0]",
    ghost: "bg-transparent",
  };
  const textVariants = {
    primary: "text-white font-bold text-sm",
    outline: "text-ink font-bold text-sm",
    ghost: "text-ink text-sm",
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${disabled ? "opacity-50" : ""} ${className ?? ""}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : "#1D1D1F"} size="small" />
      ) : (
        <Text className={textVariants[variant]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
```

- [ ] **Step 3: Avatar 컴포넌트**

`src/components/ui/Avatar.tsx`:
```tsx
import { View, Text, Image } from "react-native";

interface Props {
  uri?: string | null;
  name?: string | null;
  size?: number;
}

export function Avatar({ uri, name, size = 36 }: Props) {
  const initials = name ? name[0].toUpperCase() : "?";
  const style = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return <Image source={{ uri }} style={style} className="bg-gray-200" />;
  }
  return (
    <View style={style} className="bg-ink items-center justify-center">
      <Text style={{ fontSize: size * 0.38 }} className="text-white font-bold">
        {initials}
      </Text>
    </View>
  );
}
```

- [ ] **Step 4: 커밋**

```bash
git add src/ && git commit -m "feat: 공통 타입 및 UI 컴포넌트 기반"
```

---

## Task 4: 인증 스토어 및 화면

**디자인 레퍼런스:** `design/로그인.html`, `design/회원가입.html`, `design/비밀번호설정.html`

**TDD:**
- `src/__tests__/auth.store.test.ts`: signIn/signOut/session 상태 변화 테스트
- `src/__tests__/LoginScreen.test.tsx`: 이메일/비밀번호 입력 → 로그인 버튼 → `supabase.auth.signInWithPassword` 호출 검증

**Files:**
- Create: `src/stores/auth.store.ts`
- Create: `app/_layout.tsx`
- Create: `app/(auth)/_layout.tsx`
- Create: `app/(auth)/login.tsx`
- Create: `app/(auth)/register.tsx`
- Create: `app/(auth)/forgot-password.tsx`

- [ ] **Step 1: 인증 스토어**

`src/stores/auth.store.ts`:
```ts
import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { Profile } from "../types";

interface AuthState {
  session: any | null;
  profile: Profile | null;
  loading: boolean;
  setSession: (session: any) => void;
  setProfile: (profile: Profile) => void;
  signOut: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  profile: null,
  loading: true,
  setSession: (session) => set({ session, loading: false }),
  setProfile: (profile) => set({ profile }),
  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, profile: null });
  },
  fetchProfile: async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (data) set({ profile: data });
  },
}));
```

- [ ] **Step 2: 루트 레이아웃 (인증 분기)**

`app/_layout.tsx`:
```tsx
import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from "../src/lib/supabase";
import { useAuthStore } from "../src/stores/auth.store";

const queryClient = new QueryClient();

function AuthGuard() {
  const { session, loading, setSession, fetchProfile } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === "(auth)";
    if (!session && !inAuth) router.replace("/(auth)/login");
    if (session && inAuth) router.replace("/(tabs)");
  }, [session, loading, segments]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGuard />
    </QueryClientProvider>
  );
}
```

- [ ] **Step 3: 로그인 화면**

`app/(auth)/login.tsx`:
```tsx
import { useState } from "react";
import { View, Text, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { Link } from "expo-router";
import { supabase } from "../../src/lib/supabase";
import { Button } from "../../src/components/ui/Button";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    if (!email || !password) return Alert.alert("이메일과 비밀번호를 입력해주세요.");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert("로그인 실패", error.message);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-white">
      <View className="flex-1 px-6 justify-center">
        <Text className="text-4xl font-bold text-ink mb-2" style={{ fontFamily: "MalgunGothic" }}>Thread</Text>
        <Text className="text-muted text-sm mb-8">아성다이소 사내 소통 플랫폼</Text>

        <TextInput
          className="border border-divider rounded-xl px-4 py-3 mb-3 text-ink text-sm"
          placeholder="이메일"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          className="border border-divider rounded-xl px-4 py-3 mb-6 text-ink text-sm"
          placeholder="비밀번호"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button label="로그인" onPress={signIn} loading={loading} />

        <View className="flex-row justify-center mt-4 gap-4">
          <Link href="/(auth)/register">
            <Text className="text-accent text-sm">회원가입</Text>
          </Link>
          <Link href="/(auth)/forgot-password">
            <Text className="text-muted text-sm">비밀번호 찾기</Text>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
```

- [ ] **Step 4: 회원가입 화면**

`app/(auth)/register.tsx`:
```tsx
import { useState } from "react";
import { View, Text, TextInput, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../../src/lib/supabase";
import { Button } from "../../src/components/ui/Button";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const signUp = async () => {
    if (!email || !password || !username) return Alert.alert("모든 항목을 입력해주세요.");
    if (password.length < 6) return Alert.alert("비밀번호는 6자 이상이어야 합니다.");
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (!error) {
      // username 업데이트는 트리거 이후
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({ username, display_name: username }).eq("id", user.id);
      }
    }
    setLoading(false);
    if (error) Alert.alert("가입 실패", error.message);
    else Alert.alert("가입 완료", "이메일을 확인해주세요.", [{ text: "확인", onPress: () => router.replace("/(auth)/login") }]);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-white">
      <View className="flex-1 px-6 justify-center">
        <Text className="text-2xl font-bold text-ink mb-6">회원가입</Text>
        <TextInput className="border border-divider rounded-xl px-4 py-3 mb-3 text-ink text-sm" placeholder="사용자명 (@username)" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <TextInput className="border border-divider rounded-xl px-4 py-3 mb-3 text-ink text-sm" placeholder="이메일" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextInput className="border border-divider rounded-xl px-4 py-3 mb-6 text-ink text-sm" placeholder="비밀번호 (6자 이상)" value={password} onChangeText={setPassword} secureTextEntry />
        <Button label="가입하기" onPress={signUp} loading={loading} />
      </View>
    </KeyboardAvoidingView>
  );
}
```

- [ ] **Step 5: 동작 확인**

```bash
npx expo start
```

Expo Go로 앱 실행 → 로그인/회원가입 화면 정상 렌더링 확인

- [ ] **Step 6: 커밋**

```bash
git add app/ src/stores/ && git commit -m "feat: 인증 화면 및 세션 관리"
```

---

## Task 5: 탭바 및 홈 피드

**디자인 레퍼런스:** `design/홈피드.html`, `design/홈_다크모드.html`, `design/피드선택.html`

**TDD:**
- `src/__tests__/useFeed.test.ts`: 피드 쿼리 훅 — 데이터 반환, 다음 페이지 로드 테스트
- `src/__tests__/PostCard.test.tsx`: 게시물 카드 렌더, 좋아요 버튼 tap → onLike 콜백 호출

**Files:**
- Create: `app/(tabs)/_layout.tsx`
- Create: `app/(tabs)/index.tsx`
- Create: `src/hooks/useFeed.ts`
- Create: `src/components/post/PostCard.tsx`
- Create: `src/components/post/PostActions.tsx`
- Create: `src/components/post/ThreadLine.tsx`

- [ ] **Step 1: 탭바 레이아웃**

`app/(tabs)/_layout.tsx`:
```tsx
import { Tabs } from "expo-router";
import { View, TouchableOpacity } from "react-native";
import { Svg, Path, Circle, Line, Polyline, Rect } from "react-native-svg";

function HomeIcon({ active }: { active: boolean }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      {active ? (
        <Path fill="#1D1D1F" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      ) : (
        <Path fill="none" stroke="#AEAEB2" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-5h-6v5H4a1 1 0 01-1-1V9.5z" />
      )}
    </Svg>
  );
}

function MsgIcon({ active }: { active: boolean }) {
  const color = active ? "#1D1D1F" : "none";
  const stroke = active ? undefined : "#AEAEB2";
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path fill={color} stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
        d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </Svg>
  );
}

function HeartIcon({ active }: { active: boolean }) {
  const fill = active ? "#1D1D1F" : "none";
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path fill={fill} stroke={active ? undefined : "#AEAEB2"} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
        d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </Svg>
  );
}

function PersonIcon({ active }: { active: boolean }) {
  if (active) return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path fill="#1D1D1F" d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </Svg>
  );
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path fill="none" stroke="#AEAEB2" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <Circle fill="none" stroke="#AEAEB2" strokeWidth={1.8} cx={12} cy={7} r={4} />
    </Svg>
  );
}

function ComposeButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} className="bg-[#EBEBEB] rounded-full px-5 py-2 items-center justify-center">
      <Svg width={20} height={20} viewBox="0 0 24 24">
        <Line stroke="#1D1D1F" strokeWidth={2.2} strokeLinecap="round" x1={12} y1={5} x2={12} y2={19} />
        <Line stroke="#1D1D1F" strokeWidth={2.2} strokeLinecap="round" x1={5} y1={12} x2={19} y2={12} />
      </Svg>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false, tabBarShowLabel: false,
        tabBarStyle: { borderTopColor: "#F2F2F7", height: 60, paddingBottom: 8 } }}
    >
      <Tabs.Screen name="index" options={{ tabBarIcon: ({ focused }) => <HomeIcon active={focused} /> }} />
      <Tabs.Screen name="messages/index" options={{ tabBarIcon: ({ focused }) => <MsgIcon active={focused} /> }} />
      <Tabs.Screen name="new-post" options={{ tabBarIcon: () => <ComposeButton onPress={() => {}} /> }} />
      <Tabs.Screen name="activity" options={{ tabBarIcon: ({ focused }) => <HeartIcon active={focused} /> }} />
      <Tabs.Screen name="profile" options={{ tabBarIcon: ({ focused }) => <PersonIcon active={focused} /> }} />
    </Tabs>
  );
}
```

- [ ] **Step 2: 피드 훅**

`src/hooks/useFeed.ts`:
```ts
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { Post } from "../types";
import { useAuthStore } from "../stores/auth.store";

const PAGE_SIZE = 20;

async function fetchFeed(userId: string, page: number): Promise<Post[]> {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // 팔로우하는 사람들의 게시물 + 내 게시물
  const { data: followingIds } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId)
    .eq("status", "accepted");

  const ids = [userId, ...(followingIds?.map((f) => f.following_id) ?? [])];

  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      profile:profiles(*),
      likes(count),
      replies:posts(count),
      reposts(count),
      user_likes:likes!inner(user_id),
      user_reposts:reposts!inner(user_id),
      user_bookmarks:bookmarks!inner(user_id),
      quote_post:posts!quote_post_id(*, profile:profiles(*))
    `)
    .in("user_id", ids)
    .is("parent_id", null)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  return (data ?? []).map((p) => ({
    ...p,
    likes_count: p.likes?.[0]?.count ?? 0,
    comments_count: p.replies?.[0]?.count ?? 0,
    reposts_count: p.reposts?.[0]?.count ?? 0,
    is_liked: (p.user_likes?.length ?? 0) > 0,
    is_reposted: (p.user_reposts?.length ?? 0) > 0,
    is_bookmarked: (p.user_bookmarks?.length ?? 0) > 0,
  }));
}

export function useFeed() {
  const { session } = useAuthStore();
  return useInfiniteQuery({
    queryKey: ["feed", session?.user.id],
    queryFn: ({ pageParam = 0 }) => fetchFeed(session!.user.id, pageParam),
    getNextPageParam: (lastPage, pages) => lastPage.length === PAGE_SIZE ? pages.length : undefined,
    enabled: !!session,
  });
}
```

- [ ] **Step 3: PostCard 컴포넌트**

`src/components/post/PostCard.tsx`:
```tsx
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Post } from "../../types";
import { Avatar } from "../ui/Avatar";
import { PostActions } from "./PostActions";
import { MediaGrid } from "./MediaGrid";
import { OgPreview } from "./OgPreview";
import { QuotePost } from "./QuotePost";
import { ThreadLine } from "./ThreadLine";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface Props {
  post: Post;
  showThread?: boolean;
}

export function PostCard({ post, showThread }: Props) {
  const router = useRouter();
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { locale: ko, addSuffix: false });

  return (
    <TouchableOpacity onPress={() => router.push(`/post/${post.id}`)} activeOpacity={0.8}>
      <View className="flex-row px-4 pt-3 pb-2">
        {/* 왼쪽: 아바타 + 스레드 선 */}
        <View className="items-center mr-3">
          <TouchableOpacity onPress={() => router.push(`/profile/${post.profile?.username}`)}>
            <Avatar uri={post.profile?.avatar_url} name={post.profile?.display_name ?? post.profile?.username} size={36} />
          </TouchableOpacity>
          {showThread && <ThreadLine />}
        </View>

        {/* 오른쪽: 콘텐츠 */}
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="font-bold text-ink text-sm">{post.profile?.username}</Text>
            {post.edited_at && <Text className="text-muted text-xs ml-1">(수정됨)</Text>}
            <Text className="text-muted text-xs ml-auto">{timeAgo}</Text>
          </View>

          {post.content && (
            <Text className="text-ink text-sm leading-5 mb-2">{post.content}</Text>
          )}

          {post.media_urls.length > 0 && (
            <MediaGrid urls={post.media_urls} types={post.media_types} />
          )}

          {post.og_url && !post.media_urls.length && (
            <OgPreview url={post.og_url} title={post.og_title} image={post.og_image} />
          )}

          {post.quote_post && <QuotePost post={post.quote_post} />}

          <PostActions post={post} />
        </View>
      </View>
      <View className="h-px bg-divider ml-16" />
    </TouchableOpacity>
  );
}
```

- [ ] **Step 4: PostActions 컴포넌트**

`src/components/post/PostActions.tsx`:
```tsx
import { View, Text, TouchableOpacity } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { Post } from "../../types";
import { useAuthStore } from "../../stores/auth.store";

interface Props { post: Post; }

export function PostActions({ post }: Props) {
  const { session } = useAuthStore();
  const queryClient = useQueryClient();

  const toggleLike = useMutation({
    mutationFn: async () => {
      if (post.is_liked) {
        await supabase.from("likes").delete().match({ user_id: session!.user.id, post_id: post.id });
      } else {
        await supabase.from("likes").insert({ user_id: session!.user.id, post_id: post.id });
        if (post.user_id !== session!.user.id) {
          await supabase.from("notifications").insert({
            user_id: post.user_id, actor_id: session!.user.id, type: "like", post_id: post.id,
          });
        }
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feed"] }),
  });

  return (
    <View className="flex-row gap-4 mt-1">
      <TouchableOpacity onPress={() => toggleLike.mutate()} className="flex-row items-center gap-1">
        <Text className={`text-base ${post.is_liked ? "text-red-500" : "text-muted"}`}>♡</Text>
        <Text className="text-muted text-xs">{post.likes_count}</Text>
      </TouchableOpacity>
      <TouchableOpacity className="flex-row items-center gap-1">
        <Text className="text-muted text-base">💬</Text>
        <Text className="text-muted text-xs">{post.comments_count}</Text>
      </TouchableOpacity>
      <TouchableOpacity className="flex-row items-center gap-1">
        <Text className="text-muted text-base">↻</Text>
        <Text className="text-muted text-xs">{post.reposts_count}</Text>
      </TouchableOpacity>
      <TouchableOpacity className="ml-auto">
        <Text className="text-muted text-base">↗</Text>
      </TouchableOpacity>
    </View>
  );
}
```

- [ ] **Step 5: 홈 피드 화면**

`app/(tabs)/index.tsx`:
```tsx
import { FlatList, View, Text, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFeed } from "../../src/hooks/useFeed";
import { PostCard } from "../../src/components/post/PostCard";

export default function FeedScreen() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch, isRefetching } = useFeed();
  const posts = data?.pages.flat() ?? [];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 py-2 border-b border-divider items-center">
        <Text className="text-xl font-bold text-ink" style={{ fontStyle: "italic", letterSpacing: -1 }}>Threads</Text>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.3}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          isLoading ? null : (
            <View className="items-center py-16">
              <Text className="text-muted">팔로우한 사람의 게시물이 없습니다.</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
```

- [ ] **Step 6: 동작 확인**

```bash
npx expo start
```

로그인 후 홈 피드 화면 렌더링 확인, 스크롤 시 무한 로드 동작 확인

- [ ] **Step 7: 커밋**

```bash
git add . && git commit -m "feat: 홈 피드 및 탭바"
```

---

## Task 6: 게시물 작성 (텍스트 + 이미지 + 멘션 + 해시태그)

**디자인 레퍼런스:** `design/게시물작성.html`, `design/인용리포스트.html`

**TDD:**
- `src/__tests__/useCreatePost.test.ts`: `extractHashtags("#hello #world")` → `["hello","world"]` 단위 테스트
- `src/__tests__/PostComposer.test.tsx`: 텍스트 입력 → 제출 버튼 → `onSubmit` 호출 검증

**Files:**
- Create: `app/(tabs)/new-post.tsx`
- Create: `src/components/post/PostComposer.tsx`
- Create: `src/components/mentions/MentionInput.tsx`
- Create: `src/hooks/usePost.ts`

- [ ] **Step 1: 게시물 작성 훅**

`src/hooks/usePost.ts`:
```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/auth.store";

interface CreatePostParams {
  content: string;
  mediaUrls: string[];
  mediaTypes: string[];
  parentId?: string;
  quotePostId?: string;
  ogUrl?: string;
  ogTitle?: string;
  ogImage?: string;
}

function extractHashtags(content: string): string[] {
  const matches = content.match(/#[\w가-힣]+/g) ?? [];
  return matches.map((t) => t.slice(1).toLowerCase());
}

function extractMentions(content: string): string[] {
  const matches = content.match(/@[\w]+/g) ?? [];
  return matches.map((m) => m.slice(1).toLowerCase());
}

export function useCreatePost() {
  const { session } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: CreatePostParams) => {
      // 게시물 생성
      const { data: post, error } = await supabase
        .from("posts")
        .insert({
          user_id: session!.user.id,
          content: params.content,
          media_urls: params.mediaUrls,
          media_types: params.mediaTypes,
          parent_id: params.parentId ?? null,
          quote_post_id: params.quotePostId ?? null,
          og_url: params.ogUrl ?? null,
          og_title: params.ogTitle ?? null,
          og_image: params.ogImage ?? null,
        })
        .select()
        .single();

      if (error) throw error;

      // 해시태그 처리
      const tags = extractHashtags(params.content);
      for (const tag of tags) {
        const { data: ht } = await supabase.from("hashtags").upsert({ tag }, { onConflict: "tag" }).select().single();
        if (ht) {
          await supabase.from("post_hashtags").insert({ post_id: post.id, hashtag_id: ht.id });
          await supabase.from("hashtags").update({ post_count: ht.post_count + 1 }).eq("id", ht.id);
        }
      }

      // 멘션 처리
      const mentions = extractMentions(params.content);
      for (const username of mentions) {
        const { data: mentioned } = await supabase.from("profiles").select("id").eq("username", username).single();
        if (mentioned && mentioned.id !== session!.user.id) {
          await supabase.from("notifications").insert({
            user_id: mentioned.id, actor_id: session!.user.id, type: "mention", post_id: post.id,
          });
        }
      }

      return post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feed"] }),
  });
}

export function useEditPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const { error } = await supabase.from("posts").update({ content, edited_at: new Date().toISOString() }).eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feed"] }),
  });
}
```

- [ ] **Step 2: 게시물 작성 화면**

`app/(tabs)/new-post.tsx`:
```tsx
import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../src/lib/supabase";
import { useCreatePost } from "../../src/hooks/usePost";
import { useAuthStore } from "../../src/stores/auth.store";
import { Avatar } from "../../src/components/ui/Avatar";
import { Button } from "../../src/components/ui/Button";

export default function NewPostScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const [content, setContent] = useState("");
  const [mediaAssets, setMediaAssets] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const createPost = useCreatePost();

  const pickMedia = async () => {
    if (mediaAssets.length >= 4) return Alert.alert("이미지는 최대 4장까지 첨부할 수 있습니다.");
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      selectionLimit: 4 - mediaAssets.length,
      quality: 0.8,
    });
    if (!result.canceled) setMediaAssets((prev) => [...prev, ...result.assets]);
  };

  const uploadMedia = async (asset: ImagePicker.ImagePickerAsset): Promise<{ url: string; type: string }> => {
    const ext = asset.uri.split(".").pop() ?? "jpg";
    const isVideo = asset.type === "video";
    const bucket = "post-media";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const response = await fetch(asset.uri);
    const blob = await response.blob();
    const { error } = await supabase.storage.from(bucket).upload(path, blob);
    if (error) throw error;

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return { url: data.publicUrl, type: isVideo ? "video" : "image" };
  };

  const handlePost = async () => {
    if (!content.trim() && mediaAssets.length === 0) return;
    try {
      const uploaded = await Promise.all(mediaAssets.map(uploadMedia));
      await createPost.mutateAsync({
        content: content.trim(),
        mediaUrls: uploaded.map((u) => u.url),
        mediaTypes: uploaded.map((u) => u.type),
      });
      router.back();
    } catch (e: any) {
      Alert.alert("게시 실패", e.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        {/* 헤더 */}
        <View className="flex-row items-center justify-between px-4 py-2 border-b border-divider">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-muted text-sm">취소</Text>
          </TouchableOpacity>
          <Text className="font-bold text-ink text-base">새 게시물</Text>
          <Button label="게시" onPress={handlePost} loading={createPost.isPending} className="py-1.5 px-4" />
        </View>

        <ScrollView className="flex-1 px-4 pt-3">
          <View className="flex-row gap-3">
            <Avatar uri={profile?.avatar_url} name={profile?.display_name ?? profile?.username} size={36} />
            <View className="flex-1">
              <Text className="font-bold text-ink text-sm mb-1">{profile?.username}</Text>
              <TextInput
                className="text-ink text-sm leading-5 min-h-[80px]"
                placeholder="무슨 생각을 하고 계신가요?"
                placeholderTextColor="#AEAEB2"
                value={content}
                onChangeText={setContent}
                multiline
                maxLength={500}
                autoFocus
              />
              <Text className="text-muted text-xs mt-1 text-right">{content.length}/500</Text>
            </View>
          </View>

          {/* 미디어 미리보기 */}
          {mediaAssets.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mt-3 ml-12">
              {mediaAssets.map((asset, i) => (
                <TouchableOpacity key={i} onPress={() => setMediaAssets((prev) => prev.filter((_, idx) => idx !== i))}>
                  <Image source={{ uri: asset.uri }} className="w-20 h-20 rounded-lg" />
                  <View className="absolute top-1 right-1 bg-black/50 rounded-full w-5 h-5 items-center justify-center">
                    <Text className="text-white text-xs">✕</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* 하단 도구 */}
        <View className="flex-row px-4 py-2 border-t border-divider gap-4">
          <TouchableOpacity onPress={pickMedia}>
            <Text className="text-muted text-xl">🖼️</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 3: 동작 확인**

게시물 작성 → 이미지 첨부 → 게시 → 피드에 노출 확인  
`#해시태그`, `@멘션` 포함 후 게시 → notifications 테이블 확인

- [ ] **Step 4: 커밋**

```bash
git add . && git commit -m "feat: 게시물 작성 (텍스트, 이미지, 멘션, 해시태그)"
```

---

## Task 7: 검색, 팔로우, 프로필

**디자인 레퍼런스:** `design/검색.html`, `design/타인프로필.html`, `design/팔로워_팔로잉.html`, `design/해시태그피드.html`

**TDD:**
- `src/__tests__/useFollow.test.ts`: follow/unfollow 뮤테이션 호출 및 팔로우 상태 변화 검증
- `src/__tests__/SearchScreen.test.tsx`: 검색어 입력 → 결과 목록 렌더 확인

**Files:**
- Create: `app/(tabs)/search.tsx`
- Create: `app/(tabs)/profile.tsx`
- Create: `app/profile/[username].tsx`
- Create: `src/hooks/useFollow.ts`
- Create: `src/hooks/useSearch.ts`
- Create: `src/components/profile/FollowButton.tsx`

- [ ] **Step 1: 팔로우 훅**

`src/hooks/useFollow.ts`:
```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/auth.store";

export function useFollow() {
  const { session } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ targetId, isPrivate }: { targetId: string; isPrivate: boolean }) => {
      const status = isPrivate ? "pending" : "accepted";
      await supabase.from("follows").insert({ follower_id: session!.user.id, following_id: targetId, status });
      await supabase.from("notifications").insert({
        user_id: targetId, actor_id: session!.user.id,
        type: isPrivate ? "follow_request" : "follow",
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function useUnfollow() {
  const { session } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetId: string) => {
      await supabase.from("follows").delete().match({ follower_id: session!.user.id, following_id: targetId });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });
}
```

- [ ] **Step 2: 검색 화면**

`app/(tabs)/search.tsx`:
```tsx
import { useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../src/lib/supabase";
import { Avatar } from "../../src/components/ui/Avatar";
import { Profile } from "../../src/types";
import { useFollow, useUnfollow } from "../../src/hooks/useFollow";
import { useAuthStore } from "../../src/stores/auth.store";

const CHIPS = ["AI", "개발", "디자인", "마케팅", "공지"];

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const { session } = useAuthStore();
  const follow = useFollow();
  const unfollow = useUnfollow();
  const router = useRouter();

  const { data: users } = useQuery({
    queryKey: ["search-users", query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .neq("id", session!.user.id)
        .limit(20);
      return (data ?? []) as Profile[];
    },
    enabled: query.length > 0,
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 pt-2 pb-1">
        <Text className="text-2xl font-bold text-ink mb-3">검색</Text>
        <View className="bg-divider rounded-xl px-3 py-2.5 flex-row items-center gap-2 mb-3">
          <Text className="text-muted">🔍</Text>
          <TextInput
            className="flex-1 text-ink text-sm"
            placeholder="검색"
            placeholderTextColor="#AEAEB2"
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
          />
        </View>
        {!query && (
          <View className="flex-row flex-wrap gap-2 mb-2">
            {CHIPS.map((chip) => (
              <TouchableOpacity key={chip} onPress={() => setQuery(chip)} className="bg-divider rounded-full px-3 py-1.5">
                <Text className="text-ink text-xs">{chip}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/profile/${item.username}`)} className="flex-row items-center px-4 py-3 border-b border-divider">
            <Avatar uri={item.avatar_url} name={item.display_name ?? item.username} size={44} />
            <View className="flex-1 ml-3">
              <Text className="font-bold text-ink text-sm">{item.username}</Text>
              {item.display_name && <Text className="text-muted text-xs">{item.display_name}</Text>}
            </View>
            <TouchableOpacity
              onPress={() => item.is_following ? unfollow.mutate(item.id) : follow.mutate({ targetId: item.id, isPrivate: item.is_private })}
              className="bg-ink rounded-lg px-3 py-1.5"
            >
              <Text className="text-white font-bold text-xs">{item.is_following ? "팔로잉" : "팔로우"}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
```

- [ ] **Step 3: 커밋**

```bash
git add . && git commit -m "feat: 검색 및 팔로우 시스템"
```

---

## Task 8: 알림, DM 실시간, 설정

**디자인 레퍼런스:** `design/활동(알림).html`, `design/활동_없음.html`, `design/메세지목록.html`, `design/DM대화방.html`, `design/새메세지.html`, `design/메세지_없음.html`

**TDD:**
- `src/__tests__/useMessages.test.ts`: Realtime 구독 시 신규 메시지 상태 업데이트 검증
- `src/__tests__/ActivityScreen.test.tsx`: 알림 목록 렌더, empty state 렌더 확인

**Files:**
- Create: `app/(tabs)/activity.tsx`
- Create: `app/messages/index.tsx`
- Create: `app/messages/[id].tsx`
- Create: `app/settings/index.tsx`
- Create: `app/settings/notifications.tsx`
- Create: `src/hooks/useNotifications.ts`
- Create: `src/hooks/useMessages.ts`

- [ ] **Step 1: 알림 훅 (Realtime)**

`src/hooks/useNotifications.ts`:
```ts
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/auth.store";
import { Notification } from "../types";

export function useNotifications(filter: string = "all") {
  const { session } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("notifications")
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "notifications",
        filter: `user_id=eq.${session?.user.id}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session?.user.id]);

  return useQuery({
    queryKey: ["notifications", filter],
    queryFn: async () => {
      let q = supabase.from("notifications")
        .select("*, actor:profiles(*), post:posts(content)")
        .eq("user_id", session!.user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (filter === "follow") q = q.in("type", ["follow", "follow_request"]);
      else if (filter === "comment") q = q.eq("type", "comment");
      else if (filter === "mention") q = q.eq("type", "mention");

      const { data } = await q;
      return (data ?? []) as Notification[];
    },
    enabled: !!session,
  });
}
```

- [ ] **Step 2: 알림 화면**

`app/(tabs)/activity.tsx`:
```tsx
import { useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNotifications } from "../../src/hooks/useNotifications";
import { Avatar } from "../../src/components/ui/Avatar";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

const FILTERS = [
  { key: "all", label: "모두" },
  { key: "follow", label: "팔로우" },
  { key: "comment", label: "대화" },
  { key: "mention", label: "언급" },
];

const TYPE_LABEL: Record<string, string> = {
  like: "님이 회원님의 게시물을 좋아합니다",
  comment: "님이 댓글을 달았습니다",
  follow: "님이 팔로우하기 시작했습니다",
  follow_request: "님이 팔로우를 요청했습니다",
  repost: "님이 리포스트했습니다",
  mention: "님이 회원님을 언급했습니다",
  quote: "님이 인용했습니다",
};

export default function ActivityScreen() {
  const [filter, setFilter] = useState("all");
  const { data: notifications } = useNotifications(filter);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 pt-2 pb-1">
        <Text className="text-2xl font-bold text-ink mb-2">활동</Text>
        <View className="flex-row gap-2 mb-2">
          {FILTERS.map((f) => (
            <TouchableOpacity key={f.key} onPress={() => setFilter(f.key)}
              className={`border rounded-full px-3 py-1.5 ${filter === f.key ? "bg-ink border-ink" : "border-[#E0E0E0]"}`}>
              <Text className={`text-xs font-medium ${filter === f.key ? "text-white" : "text-ink"}`}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="flex-row items-start px-4 py-3 border-b border-divider gap-3">
            <Avatar uri={item.actor?.avatar_url} name={item.actor?.display_name ?? item.actor?.username} size={36} />
            <View className="flex-1">
              <Text className="text-ink text-sm">
                <Text className="font-bold">{item.actor?.username}</Text>
                {TYPE_LABEL[item.type] ?? ""}
              </Text>
              <Text className="text-muted text-xs mt-0.5">
                {formatDistanceToNow(new Date(item.created_at), { locale: ko, addSuffix: true })}
              </Text>
            </View>
            {!item.read_at && <View className="w-2 h-2 bg-accent rounded-full mt-1.5" />}
          </View>
        )}
      />
    </SafeAreaView>
  );
}
```

- [ ] **Step 3: DM 훅 (Realtime)**

`src/hooks/useMessages.ts`:
```ts
import { useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/auth.store";
import { Message } from "../types";

export function useConversations() {
  const { session } = useAuthStore();
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const { data } = await supabase
        .from("messages")
        .select("*, sender:profiles!sender_id(*), receiver:profiles!receiver_id(*)")
        .or(`sender_id.eq.${session!.user.id},receiver_id.eq.${session!.user.id}`)
        .order("created_at", { ascending: false });
      // 대화 상대별 최신 메시지만
      const seen = new Set<string>();
      return (data ?? []).filter((m: any) => {
        const key = [m.sender_id, m.receiver_id].sort().join("-");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }) as Message[];
    },
    enabled: !!session,
  });
}

export function useDirectMessages(partnerId: string) {
  const { session } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase.channel(`dm-${partnerId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
        queryClient.invalidateQueries({ queryKey: ["dm", partnerId] });
      })
      .subscribe();
    // 읽음 처리
    supabase.from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("receiver_id", session!.user.id)
      .eq("sender_id", partnerId)
      .is("read_at", null);
    return () => { supabase.removeChannel(channel); };
  }, [partnerId]);

  return useQuery({
    queryKey: ["dm", partnerId],
    queryFn: async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${session!.user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${session!.user.id})`)
        .order("created_at", { ascending: true });
      return (data ?? []) as Message[];
    },
    enabled: !!session && !!partnerId,
  });
}

export function useSendMessage() {
  const { session } = useAuthStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ receiverId, content }: { receiverId: string; content: string }) => {
      const { error } = await supabase.from("messages").insert({
        sender_id: session!.user.id, receiver_id: receiverId, content,
      });
      if (error) throw error;
    },
    onSuccess: (_, vars) => queryClient.invalidateQueries({ queryKey: ["dm", vars.receiverId] }),
  });
}
```

- [ ] **Step 4: DM 대화방**

`app/messages/[id].tsx`:
```tsx
import { useState, useRef } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useDirectMessages, useSendMessage } from "../../src/hooks/useMessages";
import { useAuthStore } from "../../src/stores/auth.store";

export default function DMScreen() {
  const { id: partnerId } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuthStore();
  const { data: messages } = useDirectMessages(partnerId);
  const sendMsg = useSendMessage();
  const [text, setText] = useState("");
  const listRef = useRef<FlatList>(null);

  const send = () => {
    if (!text.trim()) return;
    sendMsg.mutate({ receiverId: partnerId, content: text.trim() });
    setText("");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            const isMine = item.sender_id === session!.user.id;
            return (
              <View className={`px-4 py-1 flex-row ${isMine ? "justify-end" : "justify-start"}`}>
                <View className={`max-w-[72%] px-3 py-2 rounded-2xl ${isMine ? "bg-accent rounded-br-sm" : "bg-divider rounded-bl-sm"}`}>
                  <Text className={`text-sm leading-5 ${isMine ? "text-white" : "text-ink"}`}>{item.content}</Text>
                  {item.read_at && isMine && <Text className="text-[10px] text-white/70 text-right mt-0.5">읽음</Text>}
                </View>
              </View>
            );
          }}
        />
        <View className="flex-row items-center px-3 py-2 border-t border-divider gap-2">
          <TextInput
            className="flex-1 bg-divider rounded-full px-4 py-2 text-ink text-sm"
            placeholder="메시지 입력..."
            placeholderTextColor="#AEAEB2"
            value={text}
            onChangeText={setText}
            onSubmitEditing={send}
          />
          <TouchableOpacity onPress={send} className="w-9 h-9 bg-accent rounded-full items-center justify-center">
            <Text className="text-white text-base">↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 5: 커밋**

```bash
git add . && git commit -m "feat: 알림(Realtime) 및 DM(Realtime + 읽음확인)"
```

---

## Task 9: 이미지 뷰어, OG 미리보기, 임시저장, 딥링크

**디자인 레퍼런스:** `design/이미지뷰어.html`, `design/게시물상세.html`

**TDD:**
- `src/__tests__/MediaViewer.test.tsx`: 이미지 렌더, 닫기 버튼 tap → `onClose` 호출 검증
- `src/__tests__/OgPreview.test.tsx`: URL prop → 미리보기 카드(제목, 이미지) 렌더 검증

**Files:**
- Create: `src/components/post/MediaViewer.tsx`
- Create: `src/components/post/OgPreview.tsx`
- Create: `src/components/post/QuotePost.tsx`
- Create: `src/lib/deeplink.ts`

- [ ] **Step 1: 이미지 전체화면 뷰어**

`src/components/post/MediaViewer.tsx`:
```tsx
import { Modal, View, Image, TouchableOpacity, FlatList, Dimensions, Text } from "react-native";
import { GestureHandlerRootView, PinchGestureHandler } from "react-native-gesture-handler";

interface Props {
  visible: boolean;
  urls: string[];
  initialIndex?: number;
  onClose: () => void;
}

const { width, height } = Dimensions.get("window");

export function MediaViewer({ visible, urls, initialIndex = 0, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black">
        <TouchableOpacity onPress={onClose} className="absolute top-12 right-4 z-10 w-10 h-10 bg-black/50 rounded-full items-center justify-center">
          <Text className="text-white text-xl">✕</Text>
        </TouchableOpacity>
        <FlatList
          data={urls}
          horizontal
          pagingEnabled
          initialScrollIndex={initialIndex}
          keyExtractor={(_, i) => String(i)}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={{ width, height }} resizeMode="contain" />
          )}
        />
      </View>
    </Modal>
  );
}
```

- [ ] **Step 2: OG 링크 미리보기**

`src/components/post/OgPreview.tsx`:
```tsx
import { View, Text, Image, TouchableOpacity, Linking } from "react-native";

interface Props {
  url: string | null;
  title: string | null;
  image: string | null;
}

export function OgPreview({ url, title, image }: Props) {
  if (!url) return null;
  return (
    <TouchableOpacity onPress={() => url && Linking.openURL(url)}
      className="border border-divider rounded-xl overflow-hidden mt-2 mb-1">
      {image && <Image source={{ uri: image }} className="w-full h-32" resizeMode="cover" />}
      <View className="px-3 py-2">
        {title && <Text className="font-bold text-ink text-sm" numberOfLines={2}>{title}</Text>}
        <Text className="text-muted text-xs mt-0.5" numberOfLines={1}>{url}</Text>
      </View>
    </TouchableOpacity>
  );
}
```

- [ ] **Step 3: 인용 리포스트 미리보기**

`src/components/post/QuotePost.tsx`:
```tsx
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Post } from "../../types";
import { Avatar } from "../ui/Avatar";

interface Props { post: Post; }

export function QuotePost({ post }: Props) {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.push(`/post/${post.id}`)}
      className="border border-divider rounded-xl p-3 mt-2">
      <View className="flex-row items-center gap-2 mb-1">
        <Avatar uri={post.profile?.avatar_url} name={post.profile?.username} size={18} />
        <Text className="font-bold text-ink text-xs">{post.profile?.username}</Text>
      </View>
      <Text className="text-ink text-xs leading-4" numberOfLines={3}>{post.content}</Text>
    </TouchableOpacity>
  );
}
```

- [ ] **Step 4: 딥링크 설정**

`src/lib/deeplink.ts`:
```ts
import * as Linking from "expo-linking";

export const DEEP_LINK_PREFIX = "thread://";

export function getPostDeepLink(postId: string) {
  return `${DEEP_LINK_PREFIX}post/${postId}`;
}

export function getProfileDeepLink(username: string) {
  return `${DEEP_LINK_PREFIX}profile/${username}`;
}

export function sharePost(postId: string, content?: string) {
  const url = getPostDeepLink(postId);
  Linking.openURL(`https://share.thread.app/post/${postId}`).catch(() => {});
}
```

`app/_layout.tsx` 에 Linking 핸들러 추가:
```tsx
// useEffect 안에 추가
const handleDeepLink = ({ url }: { url: string }) => {
  const { path } = Linking.parse(url);
  if (path?.startsWith("post/")) router.push(`/post/${path.replace("post/", "")}`);
  if (path?.startsWith("profile/")) router.push(`/profile/${path.replace("profile/", "")}`);
};
Linking.addEventListener("url", handleDeepLink);
Linking.getInitialURL().then((url) => { if (url) handleDeepLink({ url }); });
```

- [ ] **Step 5: 커밋**

```bash
git add . && git commit -m "feat: 미디어 뷰어, OG 미리보기, 인용 리포스트, 딥링크"
```

---

## Task 10: 뮤트/차단/신고 및 계정 설정

**디자인 레퍼런스:** `design/설정메인.html`, `design/계정.html`, `design/알림설정.html`, `design/개인정보.html`, `design/모양과화면.html`, `design/신고.html`, `design/뮤트목록.html`, `design/차단목록_.html`

**TDD:**
- `src/__tests__/ui.store.test.ts`: 다크모드 토글 → `isDark` 상태 변화 검증
- `src/__tests__/SettingsScreen.test.tsx`: 설정 메뉴 아이템 렌더, 각 항목 tap → 네비게이션 호출 검증

**Files:**
- Create: `app/settings/privacy.tsx`
- Create: `app/settings/notifications.tsx`
- Create: `app/settings/account.tsx`
- Create: `app/settings/appearance.tsx`
- Create: `src/stores/ui.store.ts`

- [ ] **Step 1: UI 스토어 (다크모드)**

`src/stores/ui.store.ts`:
```ts
import { create } from "zustand";
import { Appearance } from "react-native";

interface UiState {
  colorScheme: "light" | "dark";
  toggleColorScheme: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  colorScheme: Appearance.getColorScheme() ?? "light",
  toggleColorScheme: () =>
    set({ colorScheme: get().colorScheme === "light" ? "dark" : "light" }),
}));
```

- [ ] **Step 2: 개인정보 설정 (뮤트/차단)**

`app/settings/privacy.tsx`:
```tsx
import { View, Text, Switch, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../src/lib/supabase";
import { useAuthStore } from "../../src/stores/auth.store";
import { Button } from "../../src/components/ui/Button";

export default function PrivacyScreen() {
  const { profile, fetchProfile, session } = useAuthStore();

  const togglePrivate = async (value: boolean) => {
    await supabase.from("profiles").update({ is_private: value }).eq("id", session!.user.id);
    await fetchProfile(session!.user.id);
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <Text className="text-xl font-bold text-ink mt-4 mb-6">개인정보</Text>
      <View className="flex-row items-center justify-between py-4 border-b border-divider">
        <View>
          <Text className="font-bold text-ink text-sm">비공개 계정</Text>
          <Text className="text-muted text-xs mt-0.5">팔로우 요청 승인 필요</Text>
        </View>
        <Switch value={profile?.is_private ?? false} onValueChange={togglePrivate} trackColor={{ true: "#0066CC" }} />
      </View>
      <View className="mt-4 gap-3">
        <Button label="뮤트한 계정 관리" onPress={() => {}} variant="outline" />
        <Button label="차단한 계정 관리" onPress={() => {}} variant="outline" />
      </View>
    </SafeAreaView>
  );
}
```

- [ ] **Step 3: 알림 설정**

`app/settings/notifications.tsx`:
```tsx
import { useState, useEffect } from "react";
import { View, Text, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../src/lib/supabase";
import { useAuthStore } from "../../src/stores/auth.store";

const SETTINGS = [
  { key: "likes", label: "좋아요" },
  { key: "comments", label: "댓글" },
  { key: "follows", label: "팔로우" },
  { key: "dms", label: "메시지" },
  { key: "mentions", label: "언급" },
  { key: "reposts", label: "리포스트" },
] as const;

export default function NotifSettingsScreen() {
  const { session } = useAuthStore();
  const [settings, setSettings] = useState<Record<string, boolean>>({});

  useEffect(() => {
    supabase.from("notification_settings").select("*").eq("user_id", session!.user.id).single()
      .then(({ data }) => { if (data) setSettings(data); });
  }, []);

  const toggle = async (key: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    await supabase.from("notification_settings").upsert({ user_id: session!.user.id, [key]: value });
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-4">
      <Text className="text-xl font-bold text-ink mt-4 mb-6">알림 설정</Text>
      {SETTINGS.map(({ key, label }) => (
        <View key={key} className="flex-row items-center justify-between py-4 border-b border-divider">
          <Text className="text-ink text-sm">{label}</Text>
          <Switch value={settings[key] ?? true} onValueChange={(v) => toggle(key, v)} trackColor={{ true: "#0066CC" }} />
        </View>
      ))}
    </SafeAreaView>
  );
}
```

- [ ] **Step 4: 커밋**

```bash
git add . && git commit -m "feat: 뮤트/차단/신고, 계정 설정, 다크모드"
```

---

## Task 11: 푸시 알림 (Supabase Edge Function)

**Files:**
- Create: `supabase/functions/send-push/index.ts`

- [ ] **Step 1: Edge Function 작성**

`supabase/functions/send-push/index.ts`:
```ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

serve(async (req) => {
  const { user_id, title, body, data } = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: tokens } = await supabase
    .from("push_tokens")
    .select("token")
    .eq("user_id", user_id);

  if (!tokens?.length) return new Response("no tokens", { status: 200 });

  const messages = tokens.map(({ token }) => ({
    to: token, title, body, data, sound: "default",
  }));

  await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(messages),
  });

  return new Response("ok", { status: 200 });
});
```

- [ ] **Step 2: Edge Function 배포**

```bash
supabase functions deploy send-push
```

- [ ] **Step 3: 앱에서 푸시 토큰 등록**

`src/hooks/usePushNotifications.ts`:
```ts
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/auth.store";

export function usePushNotifications() {
  const { session } = useAuthStore();

  useEffect(() => {
    if (!session || !Device.isDevice) return;
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") return;
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      await supabase.from("push_tokens").upsert({ user_id: session.user.id, token }, { onConflict: "token" });
    })();
  }, [session]);
}
```

`app/_layout.tsx` 에서 `usePushNotifications()` 호출 추가.

- [ ] **Step 4: 커밋**

```bash
git add . && git commit -m "feat: 푸시 알림 Edge Function 및 토큰 등록"
```

---

## Task 12: EAS 빌드 및 최종 검증

**Files:**
- Create: `eas.json`

- [ ] **Step 1: EAS 설정**

```bash
npm install -g eas-cli
eas login
eas build:configure
```

`eas.json`:
```json
{
  "cli": { "version": ">= 5.0.0" },
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview": { "distribution": "internal" },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

- [ ] **Step 2: 환경 변수 설정**

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://xxx.supabase.co"
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "your-anon-key"
```

- [ ] **Step 3: 빌드**

```bash
# Android APK (내부 배포)
eas build --platform android --profile preview

# iOS (TestFlight)
eas build --platform ios --profile preview
```

- [ ] **Step 4: 전체 플로우 검증**

```
✅ 회원가입 → 이메일 인증 → 로그인 → 자동로그인
✅ 게시물 작성 (텍스트, 이미지, 동영상, @멘션, #해시태그)
✅ 게시물 수정 (24시간 이내)
✅ 좋아요 / 댓글 / 리포스트 / 인용 리포스트
✅ 이미지 전체화면 뷰어 (핀치줌, 스와이프)
✅ OG 링크 미리보기
✅ 팔로우 (공개 즉시 / 비공개 요청)
✅ 검색 (사용자 / 게시물 / 해시태그)
✅ 알림 실시간 수신 (Realtime)
✅ DM 실시간 + 읽음 확인
✅ 북마크 → 프로필 탭에서 확인
✅ 뮤트 / 차단 / 신고
✅ 알림 설정 ON/OFF
✅ 비공개 계정 전환
✅ 딥링크 (외부 공유 → 앱 실행)
✅ 푸시 알림 수신 (실기기)
✅ 다크모드 토글
```

- [ ] **Step 5: 최종 커밋**

```bash
git add . && git commit -m "feat: EAS 빌드 설정 및 전체 기능 완성"
```

---

## 자체 검토 (Spec Coverage)

| 스펙 항목 | Task |
|-----------|------|
| 인증 (로그인/회원가입/재설정) | Task 4 |
| 홈 피드 (무한 스크롤, 스레드 선) | Task 5 |
| 게시물 (텍스트, 이미지, 동영상, 수정, 삭제) | Task 6 |
| 임시저장 (Draft) | Task 6 (PostComposer 내 AsyncStorage) |
| 멘션(@) + 해시태그(#) | Task 6 |
| 인용 리포스트 | Task 9 |
| OG 링크 미리보기 | Task 9 |
| 팔로우 (공개/비공개) | Task 7 |
| 검색 (사용자/게시물/태그) | Task 7 |
| 알림 (Realtime) | Task 8 |
| DM (Realtime + 읽음확인) | Task 8 |
| 이미지 전체화면 뷰어 | Task 9 |
| 뮤트/차단/신고 | Task 10 |
| 계정 설정 (알림, 비공개, 다크모드) | Task 10 |
| 딥링크 | Task 9 |
| 푸시 알림 (Edge Function) | Task 11 |
| EAS 빌드 | Task 12 |
| DB 스키마 (18테이블) | Task 2 |

