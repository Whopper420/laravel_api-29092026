import { getHeaders } from "./headers";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestOptions {
  method?: HttpMethod;
  json?: boolean;
  body?: unknown;
}

// Thin wrapper around fetch for authenticated API calls.
// Returns the raw Response so callers keep their own status/data handling.
export async function apiRequest(
  path: string,
  { method, json = false, body }: ApiRequestOptions = {},
): Promise<Response> {
  const options: RequestInit = {
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
