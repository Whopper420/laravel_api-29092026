import type { AuthMode } from "../../types";

export interface AuthTabsProps {
  authMode: AuthMode;
  onSelectMode: (mode: AuthMode) => void;
}

export default function AuthTabs({ authMode, onSelectMode }: AuthTabsProps) {
  return (
    <div className="auth-tabs">
      <button
        type="button"
        className={authMode === "login" ? "tab active" : "tab"}
        onClick={() => onSelectMode("login")}>
        Login
      </button>

      <button
        type="button"
        className={authMode === "register" ? "tab active" : "tab"}
        onClick={() => onSelectMode("register")}>
        Register
      </button>
    </div>
  );
}
