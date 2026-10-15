import PostCard from "./PostCard.jsx";

export default function PostList({
  posts,
  loading,
  postsError,
  onEdit,
  onDelete,
}) {
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
