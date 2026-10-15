import type { Post } from "../../types";
import PostCard from "./PostCard";

export interface PostListProps {
  posts: Post[];
  loading: boolean;
  postsError: string;
  onEdit: (post: Post) => void;
  onDelete: (id: number) => void;
}

export default function PostList({
  posts,
  loading,
  postsError,
  onEdit,
  onDelete,
}: PostListProps) {
  return (
    <div id="postsContainer">
      {loading && <p className="loading">Loading posts...</p>}

      {postsError && <p className="error">{postsError}</p>}

      {!loading && !postsError && posts.length === 0 && (
        <p>No posts found.</p>
      )}

      {!loading &&
        posts.map((post) => (
          <PostCard key={post.id} post={post} onEdit={onEdit} onDelete={onDelete} />
        ))}
    </div>
  );
}
