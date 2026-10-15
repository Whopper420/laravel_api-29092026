import AuthTabs from "./AuthTabs.jsx";
import LoginForm from "./LoginForm.jsx";
import RegisterForm from "./RegisterForm.jsx";

export default function AuthSection({
  authMode,
  authMessage,
  authMessageType,
  onSelectMode,
  login,
  register,
}) {
  return (
    <section className="card">
      <AuthTabs authMode={authMode} onSelectMode={onSelectMode} />

      {authMode === "login" && <LoginForm {...login} />}

      {authMode === "register" && <RegisterForm {...register} />}

      {authMessage && <p className={authMessageType}>{authMessage}</p>}
    </section>
  );
}
