import { readToken } from "../lib/storage";

// Builds the request headers for the Laravel API.
// Pass json = true when the request sends a JSON body.
export function getHeaders(json = false): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (json) {
    headers["Content-Type"] = "application/json";
  }

  const currentToken = readToken();

  if (currentToken) {
    headers["Authorization"] = `Bearer ${currentToken}`;
  }

  return headers;
}
