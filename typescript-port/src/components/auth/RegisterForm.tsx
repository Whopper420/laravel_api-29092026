import type { FormEvent } from "react";
import FormField from "../common/FormField";

export interface RegisterFormProps {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onPasswordConfirmationChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function RegisterForm({
  name,
  email,
  password,
  passwordConfirmation,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onPasswordConfirmationChange,
  onSubmit,
}: RegisterFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <h2>Create Account</h2>

      <FormField label="Name">
        <input
          type="text"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          required
        />
      </FormField>

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

      <FormField label="Confirm Password">
        <input
          type="password"
          value={passwordConfirmation}
          onChange={(event) => onPasswordConfirmationChange(event.target.value)}
          required
        />
      </FormField>

      <button type="submit">Register</button>
    </form>
  );
}
