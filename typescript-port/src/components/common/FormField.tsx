import type { PropsWithChildren } from "react";

// A labelled form control. Keeps every form group markup identical.
export interface FormFieldProps {
  label: string;
}

export default function FormField({
  label,
  children,
}: PropsWithChildren<FormFieldProps>) {
  return (
    <div className="form-group">
      <label>{label}</label>

      {children}
    </div>
  );
}
