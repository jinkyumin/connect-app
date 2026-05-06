import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { PostCard } from "../components/post/PostCard";
import type { Post } from "../types";

const mockPost: Post = {
  id: "1",
  user_id: "u1",
  content: "안녕하세요! 테스트 게시물입니다.",
  media_urls: [],
  media_types: [],
  og_url: null,
  og_title: null,
  og_image: null,
  parent_id: null,
  quote_post_id: null,
  is_pinned: false,
  edited_at: null,
  created_at: new Date().toISOString(),
  profile: {
    id: "u1",
    username: "testuser",
    display_name: "테스트",
    avatar_url: null,
    bio: null,
    website_url: null,
    is_private: false,
    is_admin: false,
    created_at: new Date().toISOString(),
  },
  likes_count: 5,
  comments_count: 2,
  reposts_count: 1,
  is_liked: false,
  is_reposted: false,
  is_bookmarked: false,
};

describe("PostCard", () => {
  it("renders post content", () => {
    const { getByText } = render(<PostCard post={mockPost} />);
    expect(getByText("안녕하세요! 테스트 게시물입니다.")).toBeTruthy();
  });

  it("renders username", () => {
    const { getByText } = render(<PostCard post={mockPost} />);
    expect(getByText("testuser")).toBeTruthy();
  });

  it("calls onLike when like button pressed", () => {
    const onLike = jest.fn();
    const { getByTestId } = render(<PostCard post={mockPost} onLike={onLike} />);
    fireEvent.press(getByTestId("like-button"));
    expect(onLike).toHaveBeenCalledWith(mockPost.id);
  });

  it("shows liked state", () => {
    const { getByTestId } = render(
      <PostCard post={{ ...mockPost, is_liked: true }} />
    );
    expect(getByTestId("like-button")).toBeTruthy();
  });
});
