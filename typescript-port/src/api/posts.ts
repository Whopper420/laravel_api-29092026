import { API_URL } from "./config";
import { apiRequest } from "./http";
import type { Post } from "../types";

export interface PostInput {
  title: string;
  body: string;
}

export function fetchPosts(): Promise<Response> {
  return apiRequest(`${API_URL}/posts`);
}

export function createPost({ title, body }: PostInput): Promise<Response> {
  return apiRequest(`${API_URL}/posts`, {
    method: "POST",
    json: true,
    body: { title, body },
  });
}

export function updatePost(
  id: number,
  { title, body }: PostInput,
): Promise<Response> {
  return apiRequest(`${API_URL}/posts/${id}`, {
    method: "PUT",
    json: true,
    body: { title, body },
  });
}

export function deletePost(id: number): Promise<Response> {
  return apiRequest(`${API_URL}/posts/${id}`, { method: "DELETE" });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// The API may answer with a plain array, { data: [...] } or a paginated
// { data: { data: [...] } }. Normalises all three shapes.
export function parsePostList(payload: unknown): Post[] {
  if (Array.isArray(payload)) {
    return payload as Post[];
  }

  if (!isRecord(payload)) {
    return [];
  }

  if (Array.isArray(payload.data)) {
    return payload.data as Post[];
  }

  if (isRecord(payload.data) && Array.isArray(payload.data.data)) {
    return payload.data.data as Post[];
  }

  return [];
}
