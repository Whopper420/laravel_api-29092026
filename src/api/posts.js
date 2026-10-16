import { API_URL } from "./config.js";
import { apiRequest } from "./http.js";

export function fetchPosts() {
  return apiRequest(`${API_URL}/posts`);
}

export function createPost({ title, body }) {
  return apiRequest(`${API_URL}/posts`, {
    method: "POST",
    json: true,
    body: { title, body },
  });
}

export function updatePost(id, { title, body }) {
  return apiRequest(`${API_URL}/posts/${id}`, {
    method: "PUT",
    json: true,
    body: { title, body },
  });
}

export function deletePost(id) {
  return apiRequest(`${API_URL}/posts/${id}`, { method: "DELETE" });
}

function isRecord(value) {
  return typeof value === "object" && value !== null;
}

// The API may answer with a plain array, { data: [...] } or a paginated
// { data: { data: [...] } }. Normalises all three shapes.
export function parsePostList(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!isRecord(payload)) {
    return [];
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (isRecord(payload.data) && Array.isArray(payload.data.data)) {
    return payload.data.data;
  }

  return [];
}
