// Single place that touches browser storage.
// Keeps every localStorage key and access in one file.

const TOKEN_KEY = "token";

export function readToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function writeToken(value) {
  localStorage.setItem(TOKEN_KEY, value);
}

export function eraseToken() {
  localStorage.removeItem(TOKEN_KEY);
}
