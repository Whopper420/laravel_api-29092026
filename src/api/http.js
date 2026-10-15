import { getHeaders } from "./headers.js";

// Thin wrapper around fetch for authenticated API calls.
// Returns the raw Response so callers keep their own status/data handling.
export async function apiRequest(path, { method, json = false, body } = {}) {
  const options = {
    credentials: "include",
    headers: getHeaders(json),
  };

  if (method) {
    options.method = method;
  }

  if (body !== undefined) {
    options.body = JSON.stringify(body);
  }

  return fetch(path, options);
}
