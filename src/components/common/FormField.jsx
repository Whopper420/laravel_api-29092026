// A labelled form control. Keeps every form group markup identical.
export default function FormField({ label, children }) {
  return (
    <div className="form-group">
      <label>{label}</label>

      {children}
    </div>
  );
}
