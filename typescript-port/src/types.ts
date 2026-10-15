// Shared domain types used across the app.

export interface User {
  id?: number;
  name?: string | null;
  email?: string | null;
}

export interface Post {
  id: number;
  title?: string | null;
  body?: string | null;
  user_id?: number | null;
}

export type AuthMode = "login" | "register";

export type MessageType = "" | "success" | "error";
