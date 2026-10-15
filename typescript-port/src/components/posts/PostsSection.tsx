import type { Post } from "../../types";
import type { CreatePostFormProps } from "./CreatePostForm";
import type { EditPostFormProps } from "./EditPostForm";
import CreatePostForm from "./CreatePostForm";
import EditPostForm from "./EditPostForm";
import PostList from "./PostList";

export interface PostsSectionProps {
  posts: Post[];
  loading: boolean;
  postsError: string;
  onLoadPosts: () => void;
  createPost: CreatePostFormProps;
  editingPost: Post | null;
  editPost: EditPostFormProps;
  onEdit: (post: Post) => void;
  onDelete: (id: number) => void;
}

export default function PostsSection({
  posts,
  loading,
  postsError,
  onLoadPosts,
  createPost,
  editingPost,
  editPost,
  onEdit,
  onDelete,
}: PostsSectionProps) {
  return (
    <section>
      <div className="section-header">
        <h2>Posts</h2>

        <button type="button" onClick={onLoadPosts}>
          Load Posts
        </button>
      </div>

      <CreatePostForm {...createPost} />

      {editingPost && <EditPostForm {...editPost} />}

      <PostList
        posts={posts}
        loading={loading}
        postsError={postsError}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </section>
  );
}
