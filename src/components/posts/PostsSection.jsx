import CreatePostForm from "./CreatePostForm.jsx";
import EditPostForm from "./EditPostForm.jsx";
import PostList from "./PostList.jsx";

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
}) {
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
