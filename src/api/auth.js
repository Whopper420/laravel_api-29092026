import { API_URL, BASE_URL } from "./config.js";
import { apiRequest } from "./http.js";

// Laravel Sanctum requires a CSRF cookie before any state-changing request.
export async function requestCsrfCookie() {
  const response = await fetch(`${BASE_URL}/sanctum/csrf-cookie`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Could not get CSRF cookie.");
  }

  return response;
}

// Returns { response, data } because the login flow needs both the status
// and the parsed payload (token + message).
export async function loginUser({ email, password }) {
  const response = await apiRequest(`${API_URL}/login`, {
    method: "POST",
    json: true,
    body: { email, password },
  });

  const data = await response.json().catch(() => ({}));

  return { response, data };
}

export async function registerUser({
  name,
  email,
  password,
  passwordConfirmation,
}) {
  const response = await apiRequest(`${API_URL}/register`, {
    method: "POST",
    json: true,
    body: {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    },
  });

  const data = await response.json().catch(() => ({}));

  return { response, data };
}

export function logoutUser() {
  return apiRequest(`${API_URL}/logout`, { method: "POST" });
}

export function fetchCurrentUser() {
  return apiRequest(`${API_URL}/user`);
}
