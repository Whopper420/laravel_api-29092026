import FormField from "../common/FormField.jsx";

export default function CreatePostForm({
  title,
  body,
  onTitleChange,
  onBodyChange,
  onSubmit,
}) {
  return (
    <div className="card">
      <h2>Create Post</h2>

      <form onSubmit={onSubmit}>
        <FormField label="Title">
          <input
            type="text"
            maxLength="255"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            required
          />
        </FormField>

        <FormField label="Body">
          <textarea
            rows="5"
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
