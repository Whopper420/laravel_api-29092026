import { API_URL, BASE_URL } from "./config";
import { apiRequest } from "./http";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

export interface AuthResponseData {
  token?: string;
  message?: string;
}

export interface AuthResult {
  response: Response;
  data: AuthResponseData;
}

// Laravel Sanctum requires a CSRF cookie before any state-changing request.
export async function requestCsrfCookie(): Promise<Response> {
  const response = await fetch(`${BASE_URL}/sanctum/csrf-cookie`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Could not get CSRF cookie.");
  }

  return response;
}

async function readAuthData(response: Response): Promise<AuthResponseData> {
  const data: unknown = await response.json().catch(() => ({}));

  if (typeof data !== "object" || data === null) {
    return {};
  }

  const { token, message } = data as Record<string, unknown>;

  return {
    ...(typeof token === "string" ? { token } : {}),
    ...(typeof message === "string" ? { message } : {}),
  };
}

// Returns { response, data } because the login flow needs both the status
// and the parsed payload (token + message).
export async function loginUser({
  email,
  password,
}: LoginCredentials): Promise<AuthResult> {
  const response = await apiRequest(`${API_URL}/login`, {
    method: "POST",
    json: true,
    body: { email, password },
  });

  const data = await readAuthData(response);

  return { response, data };
}

export async function registerUser({
  name,
  email,
  password,
  passwordConfirmation,
}: RegisterCredentials): Promise<AuthResult> {
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

  const data = await readAuthData(response);

  return { response, data };
}

export function logoutUser(): Promise<Response> {
  return apiRequest(`${API_URL}/logout`, { method: "POST" });
}

export function fetchCurrentUser(): Promise<Response> {
  return apiRequest(`${API_URL}/user`);
}
