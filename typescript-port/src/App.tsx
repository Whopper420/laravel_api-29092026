import useAppState from "./hooks/useAppState";
import Header from "./components/layout/Header";
import AuthSection from "./components/auth/AuthSection";
import PostsSection from "./components/posts/PostsSection";

// Root component: composes the layout and connects application state
// (from useAppState) to the presentational sections.
export default function App() {
  const {
    // Session
    user,
    // Auth
    authMode,
    authMessage,
    authMessageType,
    selectAuthMode,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    registerName,
    setRegisterName,
    registerEmail,
    setRegisterEmail,
    registerPassword,
    setRegisterPassword,
    registerPasswordConfirmation,
    setRegisterPasswordConfirmation,
    handleLogin,
    handleRegister,
    handleLogout,
    // Posts
    posts,
    loadingPosts,
    postsError,
    getPosts,
    postTitle,
    setPostTitle,
    postBody,
    setPostBody,
    handleCreatePost,
    editingPost,
    editTitle,
    setEditTitle,
    editBody,
    setEditBody,
    handleUpdatePost,
    cancelEditing,
    startEditing,
    handleDeletePost,
  } = useAppState();

  const loginForm = {
    email: loginEmail,
    password: loginPassword,
    onEmailChange: setLoginEmail,
    onPasswordChange: setLoginPassword,
    onSubmit: handleLogin,
  };

  const registerForm = {
    name: registerName,
    email: registerEmail,
    password: registerPassword,
    passwordConfirmation: registerPasswordConfirmation,
    onNameChange: setRegisterName,
    onEmailChange: setRegisterEmail,
    onPasswordChange: setRegisterPassword,
    onPasswordConfirmationChange: setRegisterPasswordConfirmation,
    onSubmit: handleRegister,
  };

  const createPostForm = {
    title: postTitle,
    body: postBody,
    onTitleChange: setPostTitle,
    onBodyChange: setPostBody,
    onSubmit: handleCreatePost,
  };

  const editPostForm = {
    title: editTitle,
    body: editBody,
    onTitleChange: setEditTitle,
    onBodyChange: setEditBody,
    onSubmit: handleUpdatePost,
    onCancel: cancelEditing,
  };

  return (
    <>
      <Header user={user} onLogout={handleLogout} />

      <main className="container">
        {!user && (
          <AuthSection
            authMode={authMode}
            authMessage={authMessage}
            authMessageType={authMessageType}
            onSelectMode={selectAuthMode}
            login={loginForm}
            register={registerForm}
          />
        )}

        {user && (
          <PostsSection
            posts={posts}
            loading={loadingPosts}
            postsError={postsError}
            onLoadPosts={getPosts}
            createPost={createPostForm}
            editingPost={editingPost}
            editPost={editPostForm}
            onEdit={startEditing}
            onDelete={handleDeletePost}
          />
        )}
      </main>
    </>
  );
}
