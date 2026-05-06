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

-- Full-text search index on posts
create index posts_content_fts on posts using gin(to_tsvector('simple', coalesce(content, '')));

-- RLS 활성화
alter table profiles enable row level security;
alter table posts enable row level security;
alter table drafts enable row level security;
alter table likes enable row level security;
alter table follows enable row level security;
alter table reposts enable row level security;
alter table bookmarks enable row level security;
alter table hashtags enable row level security;
alter table post_hashtags enable row level security;
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
create policy "Hashtags viewable" on hashtags for select using (true);
create policy "Post hashtags viewable" on post_hashtags for select using (true);

create policy "Users view own messages" on messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Users send messages" on messages for insert with check (auth.uid() = sender_id);

create policy "Users view own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Users manage own mutes" on mutes for all using (auth.uid() = muter_id);
create policy "Users manage own blocks" on blocks for all using (auth.uid() = blocker_id);
create policy "Users insert reports" on reports for insert with check (auth.uid() = reporter_id);
create policy "Users manage own notification settings" on notification_settings for all using (auth.uid() = user_id);
create policy "Users manage own push tokens" on push_tokens for all using (auth.uid() = user_id);

-- Auto-create profile + notification_settings on signup
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

-- Enable Realtime for messages and notifications
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table notifications;
