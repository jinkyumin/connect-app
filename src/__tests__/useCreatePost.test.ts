jest.mock("../lib/supabase", () => ({ supabase: {} }));

import { extractHashtags, extractMentions } from "../hooks/useCreatePost";

describe("extractHashtags", () => {
  it("extracts hashtags from content", () => {
    expect(extractHashtags("안녕 #hello #world")).toEqual(["hello", "world"]);
  });

  it("returns empty array when no hashtags", () => {
    expect(extractHashtags("no hashtags here")).toEqual([]);
  });

  it("handles duplicate hashtags", () => {
    expect(extractHashtags("#hello #hello #world")).toEqual(["hello", "world"]);
  });
});

describe("extractMentions", () => {
  it("extracts mentions from content", () => {
    expect(extractMentions("안녕 @alice @bob")).toEqual(["alice", "bob"]);
  });

  it("returns empty array when no mentions", () => {
    expect(extractMentions("no mentions")).toEqual([]);
  });
});
