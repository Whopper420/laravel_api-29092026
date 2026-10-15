import type { FormEvent } from "react";
import FormField from "../common/FormField";

export interface CreatePostFormProps {
  title: string;
  body: string;
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export default function CreatePostForm({
  title,
  body,
  onTitleChange,
  onBodyChange,
  onSubmit,
}: CreatePostFormProps) {
  return (
    <div className="card">
      <h2>Create Post</h2>

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

        <button type="submit">Create Post</button>
      </form>
    </div>
  );
}
