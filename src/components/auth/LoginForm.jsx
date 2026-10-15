import FormField from "../common/FormField.jsx";

export default function LoginForm({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit}>
      <h2>Login</h2>

      <FormField label="Email">
        <input
          type="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          required
        />
      </FormField>

      <FormField label="Password">
        <input
          type="password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          required
        />
      </FormField>

      <button type="submit">Login</button>
    </form>
  );
}
