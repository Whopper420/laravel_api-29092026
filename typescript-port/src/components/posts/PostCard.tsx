import type { Post } from "../../types";

export interface PostCardProps {
  post: Post;
  onEdit: (post: Post) => void;
  onDelete: (id: number) => void;
}

export default function PostCard({ post, onEdit, onDelete }: PostCardProps) {
  return (
    <article className="post">
      <h2>{post.title || "No title"}</h2>

      <p>{post.body || "No body"}</p>

      <small className="post-id">Post ID: {post.id}</small>

      <div className="button-row">
        <button type="button" onClick={() => onEdit(post)}>
          Edit
        </button>

        <button
          type="button"
          className="delete"
          onClick={() => onDelete(post.id)}>
          Delete
        </button>
      </div>
    </article>
  );
}
