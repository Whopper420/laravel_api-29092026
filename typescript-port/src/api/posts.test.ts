import { describe, it, expect } from "vitest";
import { parsePostList } from "./posts";
import type { Post } from "../types";

const posts: Post[] = [
  { id: 1, title: "a" },
  { id: 2, title: "b" },
];

describe("parsePostList", () => {
  it("returns a plain array unchanged", () => {
    expect(parsePostList(posts)).toEqual(posts);
  });

  it("unwraps a { data: [...] } envelope", () => {
    expect(parsePostList({ data: posts })).toEqual(posts);
  });

  it("unwraps a paginated { data: { data: [...] } } envelope", () => {
    expect(parsePostList({ data: { data: posts } })).toEqual(posts);
  });

  it("returns an empty array for unexpected shapes", () => {
    expect(parsePostList(null)).toEqual([]);
    expect(parsePostList(undefined)).toEqual([]);
    expect(parsePostList("nope")).toEqual([]);
    expect(parsePostList(42)).toEqual([]);
    expect(parsePostList({ data: "nope" })).toEqual([]);
  });
});
