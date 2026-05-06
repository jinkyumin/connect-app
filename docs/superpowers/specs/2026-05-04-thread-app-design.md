# Connect 앱 — 설계 문서

**작성일:** 2026-05-04  
**대상:** 아성다이소 IT팀 사내 소통 플랫폼  
**버전:** v2.0 (기능 확장)

---

## 1. 배경 및 목적

10~50명 규모의 사내 팀이 업무 관련 짧은 텍스트/이미지 게시물을 공유하고, 팔로우 기반으로 소통할 수 있는 사내 전용 Threads 클론 앱. 외부 SNS 대신 사내 폐쇄망에서 운영하여 정보 보안을 유지하면서도 팀 간 소통 활성화를 목적으로 한다.

---

## 2. 기술 스택

| 레이어 | 기술 |
|--------|------|
| 모바일 앱 | Expo SDK (React Native) |
| 라우팅 | Expo Router (파일 기반) |
| 스타일링 | NativeWind (Tailwind CSS) |
| 전역 상태 | Zustand |
| 서버 상태 캐싱 | React Query (TanStack Query) |
| 백엔드/DB | Supabase (PostgreSQL) |
| 인증 | Supabase Auth (이메일 + 비밀번호) |
| 파일 스토리지 | Supabase Storage |
| 실시간 | Supabase Realtime |
| 푸시 알림 | Expo Push Notifications + Supabase Edge Functions |
| OG 미리보기 | link-preview-js (클라이언트 파싱) |
| 빌드/배포 | Expo EAS Build & Submit |

---

## 3. 주요 기능 범위

### 3.1 인증
- 이메일 + 비밀번호 회원가입 / 로그인
- 이메일 인증 (Supabase Auth 기본 제공)
- 자동 로그인 (세션 유지)
- 로그아웃
- 비밀번호 재설정 (이메일 발송)

### 3.2 피드
- 팔로우한 사람들의 게시물 타임라인 (최신순)
- 무한 스크롤 (페이지네이션, 20건씩)
- 게시물에 스레드 연결선 표시 (댓글 체인 시각화)
- 공지사항 게시물 상단 고정 (관리자 전용)

### 3.3 게시물
- 텍스트 게시물 작성 (최대 500자)
- 이미지 첨부 (최대 4장, Supabase Storage)
- 동영상 업로드 (최대 1개, 60초 이하)
- 게시물 수정 (작성 후 24시간 이내)
- 게시물 삭제 (본인 것만)
- 게시물 임시저장 (Draft) — 앱 종료 시 자동저장, 재진입 시 복원
- 게시물 상세 — 스레드 형식 댓글 체인
- 링크 URL 입력 시 OG 미리보기 카드 자동 생성

### 3.4 인터랙션
- 좋아요 / 좋아요 취소
- 댓글 (스레드 방식 — 게시물 하위에 연결)
- 리포스트 (단순 공유)
- 인용 리포스트 (Quote Post) — 코멘트 추가하여 공유
- 공유 (외부 공유 시트 + 딥링크)
- 게시물 북마크/저장 → 프로필 탭에서 모아보기

### 3.5 멘션 & 해시태그
- 게시물/댓글 작성 시 `@username` 입력 → 자동완성 드롭다운
- `@멘션` 시 해당 사용자에게 알림 발송
- 게시물/댓글에 `#태그` 작성 → 클릭 시 태그별 피드
- 검색에서 해시태그 검색 지원

### 3.6 팔로우 시스템
- 팔로우 / 언팔로우
- 팔로워 / 팔로잉 목록
- 비공개 계정 (Private Account) — 팔로우 요청 → 승인/거절
- 사용자 프로필 페이지

### 3.7 검색
- 사용자 검색 (username, display_name)
- 게시물 내용 검색 (full-text search)
- 해시태그 검색
- 추천 검색어 칩 표시
- 팔로우 버튼 인라인 제공

### 3.8 알림 (활동)
- 좋아요, 댓글, 팔로우, 팔로우 요청, 리포스트, 언급, 인용 알림
- 필터 탭: 모두 / 팔로우 / 대화 / 언급
- 추천 스레드 노출
- 읽음 처리 (탭 진입 시 전체 읽음)

### 3.9 DM (메시지)
- 1:1 텍스트 메시지
- 이미지 전송 (DM 내 이미지 첨부)
- 대화 목록 (받은 메시지함 / 요청)
- 메시지 요청 수락/거절 (비팔로워 → 요청함)
- 실시간 수신 (Supabase Realtime)
- 읽음 확인 (Read Receipt) — 상대방이 읽으면 표시
- 안 읽은 메시지 뱃지

### 3.10 프로필
- 사용자명, 표시이름, 프로필 사진, 소개글, 외부 링크
- 게시물 수 / 팔로워 / 팔로잉 통계
- 탭: 스레드 / 답글 / 미디어 / 리포스트 / **북마크** (본인만 보임)
- 프로필 편집 / 프로필 공유 (딥링크)
- 비공개 계정 설정

### 3.11 이미지/동영상 뷰어
- 첨부 이미지 탭 시 전체화면 뷰어
- 핀치 줌 (확대/축소)
- 좌우 스와이프로 여러 장 탐색
- 동영상 재생 (인라인 플레이어, 음소거 기본)

### 3.12 사용자 관계 제어
- **뮤트 (Mute)** — 팔로우 유지하되 해당 사용자 게시물 피드에서 숨김
- **차단 (Block)** — 게시물/DM 완전 차단, 프로필 접근 불가
- 뮤트/차단 목록 관리 (설정 > 개인정보)

### 3.13 신고
- 게시물 신고 (스팸, 부적절한 콘텐츠, 허위정보 등)
- 사용자 신고
- 신고 접수 시 관리자에게 이메일 알림 (Supabase Edge Function)

### 3.14 계정 설정
- 비밀번호 변경
- 알림 수신 설정 (종류별 ON/OFF: 좋아요, 댓글, 팔로우, DM, 멘션)
- 다크모드 (시스템 설정 연동 + 수동 토글)
- 비공개 계정 전환
- 계정 탈퇴

### 3.15 딥링크 (Deep Link)
- 게시물 공유 → `thread://post/{id}` 링크
- 프로필 공유 → `thread://profile/{username}` 링크
- 외부에서 링크 탭 시 앱 실행 + 해당 화면으로 이동
- Expo Linking API 활용

### 3.16 푸시 알림
- 좋아요, 댓글, 팔로우, DM 수신, 멘션, 팔로우 요청 시 푸시
- Expo Push Token 등록 / 갱신
- Supabase Edge Function으로 발송 트리거
- 알림 설정에 따라 발송 여부 결정

---

## 4. 데이터베이스 스키마

```sql
-- 프로필
profiles (
  id uuid PK (= auth.users.id),
  username text UNIQUE NOT NULL,
  display_name text,
  avatar_url text,
  bio text,
  website_url text,
  is_private boolean DEFAULT false,
  is_admin boolean DEFAULT false,
  created_at timestamptz
)

-- 게시물 (스레드/댓글 포함)
posts (
  id uuid PK,
  user_id uuid FK profiles,
  content text,                -- 최대 500자
  media_urls text[],           -- 이미지/동영상 Storage URL 배열
  media_types text[],          -- 'image' | 'video' per item
  og_url text,                 -- 링크 미리보기 원본 URL
  og_title text,
  og_image text,
  parent_id uuid FK posts,     -- NULL=최상위, 값 있으면 댓글
  quote_post_id uuid FK posts, -- 인용 리포스트 대상
  is_pinned boolean DEFAULT false, -- 공지 고정 (admin only)
  edited_at timestamptz,       -- 수정된 경우 시각
  created_at timestamptz
)

-- 임시저장 (Draft)
drafts (
  id uuid PK,
  user_id uuid FK profiles,
  content text,
  media_uris text[],           -- 로컬 URI (업로드 전)
  parent_id uuid FK posts,
  updated_at timestamptz
)

-- 좋아요
likes (
  id uuid PK,
  user_id uuid FK profiles,
  post_id uuid FK posts,
  created_at timestamptz,
  UNIQUE(user_id, post_id)
)

-- 팔로우
follows (
  follower_id uuid FK profiles,
  following_id uuid FK profiles,
  status text DEFAULT 'accepted', -- 'pending' | 'accepted'
  created_at timestamptz,
  PRIMARY KEY(follower_id, following_id)
)

-- 리포스트
reposts (
  id uuid PK,
  user_id uuid FK profiles,
  post_id uuid FK posts,
  created_at timestamptz,
  UNIQUE(user_id, post_id)
)

-- 북마크
bookmarks (
  id uuid PK,
  user_id uuid FK profiles,
  post_id uuid FK posts,
  created_at timestamptz,
  UNIQUE(user_id, post_id)
)

-- 해시태그
hashtags (
  id uuid PK,
  tag text UNIQUE NOT NULL,
  post_count int DEFAULT 0,
  created_at timestamptz
)

post_hashtags (
  post_id uuid FK posts,
  hashtag_id uuid FK hashtags,
  PRIMARY KEY(post_id, hashtag_id)
)

-- DM 메시지
messages (
  id uuid PK,
  sender_id uuid FK profiles,
  receiver_id uuid FK profiles,
  content text,
  media_url text,              -- DM 이미지 첨부
  read_at timestamptz,         -- NULL이면 안 읽음
  created_at timestamptz
)

-- 알림
notifications (
  id uuid PK,
  user_id uuid FK profiles,
  actor_id uuid FK profiles,
  type text,                   -- 'like'|'comment'|'follow'|'follow_request'|'repost'|'mention'|'quote'
  post_id uuid FK posts,
  read_at timestamptz,
  created_at timestamptz
)

-- 뮤트
mutes (
  muter_id uuid FK profiles,
  muted_id uuid FK profiles,
  created_at timestamptz,
  PRIMARY KEY(muter_id, muted_id)
)

-- 차단
blocks (
  blocker_id uuid FK profiles,
  blocked_id uuid FK profiles,
  created_at timestamptz,
  PRIMARY KEY(blocker_id, blocked_id)
)

-- 신고
reports (
  id uuid PK,
  reporter_id uuid FK profiles,
  post_id uuid FK posts,       -- 게시물 신고 (선택)
  reported_user_id uuid FK profiles, -- 사용자 신고 (선택)
  reason text,                 -- 'spam'|'inappropriate'|'misinformation'|'other'
  detail text,
  created_at timestamptz
)

-- 알림 설정
notification_settings (
  user_id uuid PK FK profiles,
  likes boolean DEFAULT true,
  comments boolean DEFAULT true,
  follows boolean DEFAULT true,
  dms boolean DEFAULT true,
  mentions boolean DEFAULT true,
  reposts boolean DEFAULT true
)

-- 푸시 토큰
push_tokens (
  id uuid PK,
  user_id uuid FK profiles,
  token text UNIQUE,
  created_at timestamptz
)
```

---

## 5. 화면 구조 (Expo Router)

```
app/
├── (auth)/
│   ├── login.tsx               # 로그인
│   ├── register.tsx            # 회원가입
│   └── forgot-password.tsx     # 비밀번호 재설정
├── (tabs)/
│   ├── index.tsx               # 홈 피드
│   ├── search.tsx              # 검색 (사용자/게시물/태그)
│   ├── new-post.tsx            # 게시물 작성 (모달)
│   ├── activity.tsx            # 활동(알림)
│   └── profile.tsx             # 내 프로필
├── post/
│   ├── [id].tsx                # 게시물 상세 (스레드)
│   └── edit/[id].tsx           # 게시물 수정
├── profile/[username].tsx      # 타인 프로필
├── hashtag/[tag].tsx           # 해시태그 피드
├── messages/
│   ├── index.tsx               # DM 목록
│   └── [id].tsx                # DM 대화방
├── settings/
│   ├── index.tsx               # 설정 메인
│   ├── account.tsx             # 계정 설정 (비밀번호, 탈퇴)
│   ├── notifications.tsx       # 알림 설정
│   ├── privacy.tsx             # 개인정보 (비공개, 뮤트, 차단)
│   └── appearance.tsx          # 다크모드
└── _layout.tsx                 # 루트 레이아웃
```

---

## 6. UI 디자인 시스템

- **폰트:** 맑은 고딕 (Malgun Gothic) 전용
- **액센트 컬러:** #0066CC (팔로우 버튼, 인증 배지, 링크)
- **기본 텍스트:** #1D1D1F
- **보조 텍스트:** #AEAEB2
- **구분선:** #F2F2F7
- **배경 (라이트):** #FFFFFF / **배경 (다크):** #272729
- **탭바 아이콘:** SVG outline/filled 스타일
  - 홈(집), 메시지(말풍선+뱃지), +(회색 pill), 활동(하트), 프로필(사람)
  - 활성 탭: filled 아이콘
- **게시물 작성 버튼:** 회색 pill 형태, 중앙 배치

---

## 7. 실시간 기능

| 기능 | 구현 방식 |
|------|-----------|
| DM 수신 | Supabase Realtime (messages 테이블 subscribe) |
| 읽음 확인 | Supabase Realtime (messages.read_at 업데이트 감지) |
| 알림 수신 | Supabase Realtime (notifications 테이블 subscribe) |
| 푸시 알림 | Supabase Edge Function → Expo Push API |

---

## 8. 검증 방법

1. `npx expo start` — Expo Go로 실시간 확인
2. 전체 플로우: 회원가입 → 로그인 → 게시물 작성(이미지/동영상) → 좋아요/댓글/리포스트/인용 → 멘션/해시태그 → 팔로우 → DM → 알림 확인
3. 비공개 계정: 팔로우 요청 → 승인 → 피드 노출 확인
4. 차단/뮤트: 차단 후 게시물 숨김 확인
5. 딥링크: 공유 링크 탭 → 앱 실행 + 해당 화면 이동 확인
6. Supabase Dashboard에서 DB 데이터 확인
7. 두 디바이스로 DM 실시간 수신 + 읽음 확인 테스트
8. Expo EAS Build로 iOS/Android 실기기 빌드 테스트

---

## 9. 개발 순서 (권장)

1. Supabase 프로젝트 생성 + 전체 스키마 마이그레이션
2. Expo 프로젝트 초기화 (Expo Router + NativeWind)
3. 디자인 시스템 (색상, 폰트, 공통 컴포넌트)
4. 인증 화면 (로그인/회원가입/비밀번호 재설정)
5. 홈 피드 + 게시물 작성 (텍스트)
6. 이미지/동영상 업로드 + 이미지 뷰어
7. 좋아요 / 댓글 / 리포스트 / 인용 리포스트
8. 멘션(@) + 해시태그(#) 파싱 및 자동완성
9. 팔로우 시스템 (공개/비공개 계정)
10. 검색 (사용자 + 게시물 + 해시태그)
11. 프로필 (편집, 탭, 북마크)
12. 게시물 수정 / 임시저장
13. OG 링크 미리보기
14. 알림 (활동) — Realtime 연동
15. DM — Realtime + 읽음 확인
16. 뮤트 / 차단 / 신고
17. 계정 설정 (알림설정, 다크모드, 비공개, 탈퇴)
18. 딥링크 설정
19. 푸시 알림 (Edge Function)
20. EAS Build 설정 + 배포

