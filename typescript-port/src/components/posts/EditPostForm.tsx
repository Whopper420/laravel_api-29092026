import type { FormEvent } from "react";
import FormField from "../common/FormField";

export interface EditPostFormProps {
  title: string;
  body: string;
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}

export default function EditPostForm({
  title,
  body,
  onTitleChange,
  onBodyChange,
  onSubmit,
  onCancel,
}: EditPostFormProps) {
  return (
    <div id="editContainer" className="card">
      <h2>Edit Post</h2>

      <form onSubmit={onSubmit}>
        <FormField label="Title">
          <input
            type="text"
            maxLength={255}
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            required
          />
        </FormField>

        <FormField label="Body">
          <textarea
            rows={5}
            value={body}
            onChange={(event) => onBodyChange(event.target.value)}
            required
          />
        </FormField>

        <div className="button-row">
          <button type="submit">Update Post</button>

          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
