import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

const API_URL = "http://localhost:8000/api";
const BASE_URL = "http://localhost:8000";

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  const [authMode, setAuthMode] = useState("login");
  const [authMessage, setAuthMessage] = useState("");
  const [authMessageType, setAuthMessageType] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerPasswordConfirmation, setRegisterPasswordConfirmation] =
    useState("");

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState("");

  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");

  const [editingPost, setEditingPost] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  // ==========================================
  // TOKEN
  // ==========================================

  function saveToken(newToken) {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  }

  function clearToken() {
    localStorage.removeItem("token");
    setToken(null);
  }

  // ==========================================
  // HEADERS
  // ==========================================

  function getHeaders(json = false) {
    const headers = {
      Accept: "application/json",
    };

    if (json) {
      headers["Content-Type"] = "application/json";
    }

    const currentToken = localStorage.getItem("token");

    if (currentToken) {
      headers.Authorization = `Bearer ${currentToken}`;
    }

    return headers;
  }

  // ==========================================
  // MESSAGE
  // ==========================================

  function showMessage(message, type = "") {
    setAuthMessage(message);
    setAuthMessageType(type);
  }

  // ==========================================
  // CSRF
  // ==========================================

  async function getCsrfCookie() {
    const response = await fetch(`${BASE_URL}/sanctum/csrf-cookie`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Could not get CSRF cookie.");
    }
  }

  // ==========================================
  // CURRENT USER
  // ==========================================

  async function getCurrentUser() {
    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/user`, {
        credentials: "include",
        headers: getHeaders(),
      });

      if (response.status === 401) {
        clearToken();
        setUser(null);
        setPosts([]);
        return;
      }

      if (!response.ok) {
        setUser(null);
        return;
      }

      const userData = await response.json();

      setUser(userData);

      getPosts();
    } catch (error) {
      console.error(error);
      setUser(null);
    }
  }

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    if (token) {
      getCurrentUser();
    }
  }, []);

  // ==========================================
  // LOGIN
  // ==========================================

  async function handleLogin(event) {
    event.preventDefault();

    showMessage("Logging in...");

    try {
      await getCsrfCookie();

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        credentials: "include",
        headers: getHeaders(true),
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        showMessage(data.message || "Login failed.", "error");
        return;
      }

      if (data.token) {
        saveToken(data.token);
      }

      setLoginEmail("");
      setLoginPassword("");

      showMessage("Login successful!", "success");

      await getCurrentUser();
    } catch (error) {
      console.error(error);

      showMessage("Cannot connect to Laravel.", "error");
    }
  }

  // ==========================================
  // REGISTER
  // ==========================================

  async function handleRegister(event) {
    event.preventDefault();

    if (registerPassword !== registerPasswordConfirmation) {
      showMessage("Passwords do not match.", "error");
      return;
    }

    showMessage("Creating account...");

    try {
      await getCsrfCookie();

      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        credentials: "include",
        headers: getHeaders(true),
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
          password_confirmation: registerPasswordConfirmation,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        showMessage(data.message || "Registration failed.", "error");
        return;
      }

      if (data.token) {
        saveToken(data.token);
      }

      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");
      setRegisterPasswordConfirmation("");

      showMessage("Registration successful!", "success");

      await getCurrentUser();
    } catch (error) {
      console.error(error);

      showMessage("Cannot connect to Laravel.", "error");
    }
  }

  // ==========================================
  // LOGOUT
  // ==========================================

  async function handleLogout() {
    try {
      const response = await fetch(`${API_URL}/logout`, {
        method: "POST",
        credentials: "include",
        headers: getHeaders(),
      });

      if (response.ok || response.status === 401) {
        clearToken();
        setUser(null);
        setPosts([]);
        setEditingPost(null);

        showMessage("You have been logged out.");
      }
    } catch (error) {
      console.error(error);
      alert("Could not connect to Laravel.");
    }
  }

  // ==========================================
  // GET POSTS
  // ==========================================

  async function getPosts() {
    setLoadingPosts(true);
    setPostsError("");

    try {
      const response = await fetch(`${API_URL}/posts`, {
        credentials: "include",
        headers: getHeaders(),
      });

      if (response.status === 401) {
        clearToken();
        setUser(null);
        setPosts([]);
        return;
      }

      if (!response.ok) {
        setPostsError(`API Error: ${response.status}`);
        return;
      }

      const data = await response.json();

      let loadedPosts = [];

      if (Array.isArray(data)) {
        loadedPosts = data;
      } else if (Array.isArray(data.data)) {
        loadedPosts = data.data;
      } else if (data.data && Array.isArray(data.data.data)) {
        loadedPosts = data.data.data;
      }

      setPosts(loadedPosts);
    } catch (error) {
      console.error(error);

      setPostsError("Cannot connect to Laravel.");
    } finally {
      setLoadingPosts(false);
    }
  }

  // ==========================================
  // CREATE POST
  // ==========================================

  async function handleCreatePost(event) {
    event.preventDefault();

    const title = postTitle.trim();
    const body = postBody.trim();

    if (!title || !body) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: "POST",
        credentials: "include",
        headers: getHeaders(true),
        body: JSON.stringify({
          title,
          body,
        }),
      });

      if (response.status === 401) {
        clearToken();
        setUser(null);
        return;
      }

      if (!response.ok) {
        alert(`Could not create post. HTTP ${response.status}`);
        return;
      }

      setPostTitle("");
      setPostBody("");

      await getPosts();
    } catch (error) {
      console.error(error);

      alert("Could not connect to Laravel.");
    }
  }

  // ==========================================
  // EDIT
  // ==========================================

  function startEditing(post) {
    setEditingPost(post);
    setEditTitle(post.title || "");
    setEditBody(post.body || "");

    setTimeout(() => {
      document.getElementById("editContainer")?.scrollIntoView({
        behavior: "smooth",
      });
    }, 50);
  }

  function cancelEditing() {
    setEditingPost(null);
    setEditTitle("");
    setEditBody("");
  }

  // ==========================================
  // UPDATE POST
  // ==========================================

  async function handleUpdatePost(event) {
    event.preventDefault();

    if (!editingPost) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/posts/${editingPost.id}`, {
        method: "PUT",
        credentials: "include",
        headers: getHeaders(true),
        body: JSON.stringify({
          title: editTitle.trim(),
          body: editBody.trim(),
        }),
      });

      if (response.status === 401) {
        clearToken();
        setUser(null);
        return;
      }

      if (!response.ok) {
        alert(`Could not update post. HTTP ${response.status}`);
        return;
      }

      cancelEditing();

      await getPosts();
    } catch (error) {
      console.error(error);

      alert("Could not connect to Laravel.");
    }
  }

  // ==========================================
  // DELETE POST
  // ==========================================

  async function handleDeletePost(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/posts/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: getHeaders(),
      });

      if (response.status === 401) {
        clearToken();
        setUser(null);
        return;
      }

      if (!response.ok) {
        alert(`Could not delete post. HTTP ${response.status}`);
        return;
      }

      if (editingPost && editingPost.id === id) {
        cancelEditing();
      }

      await getPosts();
    } catch (error) {
      console.error(error);

      alert("Could not connect to Laravel.");
    }
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <>
      <header className="header">
        <div className="container">
          <h1>Laravel Posts</h1>

          <div id="userArea">
            <span id="userInfo">
              {user
                ? `Logged in as ${user.name || user.email || "User"}`
                : "Not logged in"}
            </span>

            {user && <button onClick={handleLogout}>Logout</button>}
          </div>
        </div>
      </header>

      <main className="container">
        {!user && (
          <section className="card">
            <div className="auth-tabs">
              <button
                type="button"
                className={authMode === "login" ? "tab active" : "tab"}
                onClick={() => {
                  setAuthMode("login");
                  showMessage("");
                }}>
                Login
              </button>

              <button
                type="button"
                className={authMode === "register" ? "tab active" : "tab"}
                onClick={() => {
                  setAuthMode("register");
                  showMessage("");
                }}>
                Register
              </button>
            </div>

            {authMode === "login" && (
              <form onSubmit={handleLogin}>
                <h2>Login</h2>

                <div className="form-group">
                  <label>Email</label>

                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(event) => setLoginEmail(event.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>

                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(event) => setLoginPassword(event.target.value)}
                    required
                  />
                </div>

                <button type="submit">Login</button>
              </form>
            )}

            {authMode === "register" && (
              <form onSubmit={handleRegister}>
                <h2>Create Account</h2>

                <div className="form-group">
                  <label>Name</label>

                  <input
                    type="text"
                    value={registerName}
                    onChange={(event) => setRegisterName(event.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>

                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(event) => setRegisterEmail(event.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>

                  <input
                    type="password"
                    value={registerPassword}
                    onChange={(event) =>
                      setRegisterPassword(event.target.value)
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Confirm Password</label>

                  <input
                    type="password"
                    value={registerPasswordConfirmation}
                    onChange={(event) =>
                      setRegisterPasswordConfirmation(event.target.value)
                    }
                    required
                  />
                </div>

                <button type="submit">Register</button>
              </form>
            )}

            {authMessage && <p className={authMessageType}>{authMessage}</p>}
          </section>
        )}

        {user && (
          <section>
            <div className="section-header">
              <h2>Posts</h2>

              <button type="button" onClick={getPosts}>
                Load Posts
              </button>
            </div>

            <div className="card">
              <h2>Create Post</h2>

              <form onSubmit={handleCreatePost}>
                <div className="form-group">
                  <label>Title</label>

                  <input
                    type="text"
                    maxLength="255"
                    value={postTitle}
                    onChange={(event) => setPostTitle(event.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Body</label>

                  <textarea
                    rows="5"
                    value={postBody}
                    onChange={(event) => setPostBody(event.target.value)}
                    required
                  />
                </div>

                <button type="submit">Create Post</button>
              </form>
            </div>

            {editingPost && (
              <div id="editContainer" className="card">
                <h2>Edit Post</h2>

                <form onSubmit={handleUpdatePost}>
                  <div className="form-group">
                    <label>Title</label>

                    <input
                      type="text"
                      maxLength="255"
                      value={editTitle}
                      onChange={(event) => setEditTitle(event.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Body</label>

                    <textarea
                      rows="5"
                      value={editBody}
                      onChange={(event) => setEditBody(event.target.value)}
                      required
                    />
                  </div>

                  <div className="button-row">
                    <button type="submit">Update Post</button>

                    <button
                      type="button"
                      className="secondary"
                      onClick={cancelEditing}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div id="postsContainer">
              {loadingPosts && <p className="loading">Loading posts...</p>}

              {postsError && <p className="error">{postsError}</p>}

              {!loadingPosts && !postsError && posts.length === 0 && (
                <p>No posts found.</p>
              )}

              {!loadingPosts &&
                posts.map((post) => (
                  <article className="post" key={post.id}>
                    <h2>{post.title || "No title"}</h2>

                    <p>{post.body || "No body"}</p>

                    <small className="post-id">Post ID: {post.id}</small>

                    <div className="button-row">
                      <button type="button" onClick={() => startEditing(post)}>
                        Edit
                      </button>

                      <button
                        type="button"
                        className="delete"
                        onClick={() => handleDeletePost(post.id)}>
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
