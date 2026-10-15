import type { AuthMode, MessageType } from "../../types";
import type { LoginFormProps } from "./LoginForm";
import type { RegisterFormProps } from "./RegisterForm";
import AuthTabs from "./AuthTabs";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export interface AuthSectionProps {
  authMode: AuthMode;
  authMessage: string;
  authMessageType: MessageType;
  onSelectMode: (mode: AuthMode) => void;
  login: LoginFormProps;
  register: RegisterFormProps;
}

export default function AuthSection({
  authMode,
  authMessage,
  authMessageType,
  onSelectMode,
  login,
  register,
}: AuthSectionProps) {
  return (
    <section className="card">
      <AuthTabs authMode={authMode} onSelectMode={onSelectMode} />

      {authMode === "login" && <LoginForm {...login} />}

      {authMode === "register" && <RegisterForm {...register} />}

      {authMessage && <p className={authMessageType}>{authMessage}</p>}
    </section>
  );
}
