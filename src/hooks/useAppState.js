import { useEffect, useState } from "react";
import { readToken, writeToken, eraseToken } from "../lib/storage.js";
import {
  requestCsrfCookie,
  loginUser,
  registerUser,
  logoutUser,
  fetchCurrentUser,
} from "../api/auth.js";
import {
  fetchPosts,
  createPost,
  updatePost,
  deletePost,
  parsePostList,
} from "../api/posts.js";

// Owns every piece of application state and every action that can change it.
// Components stay presentational and receive plain values + callbacks.
export default function useAppState() {
  // ---- Session ----------------------------------------------------------
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(readToken);

  // ---- Auth screen ------------------------------------------------------
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

  // ---- Posts ------------------------------------------------------------
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState("");

  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");

  const [editingPost, setEditingPost] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  // ---- Token helpers ----------------------------------------------------

  function saveToken(newToken) {
    writeToken(newToken);
    setToken(newToken);
  }

  function clearToken() {
    eraseToken();
    setToken(null);
  }

  // ---- Shared UI helpers -----------------------------------------------

  function showMessage(message, type = "") {
    setAuthMessage(message);
    setAuthMessageType(type);
  }

  function selectAuthMode(mode) {
    setAuthMode(mode);
    showMessage("");
  }

  function cancelEditing() {
    setEditingPost(null);
    setEditTitle("");
    setEditBody("");
  }

  // ---- Session loading --------------------------------------------------

  async function getCurrentUser() {
    if (!readToken()) {
      return;
    }

    try {
      const response = await fetchCurrentUser();

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

  // Restore the session on first load.
  useEffect(() => {
    if (token) {
      getCurrentUser();
    }
  }, []);

  // ---- Auth actions -----------------------------------------------------

  async function handleLogin(event) {
    event.preventDefault();

    showMessage("Logging in...");

    try {
      await requestCsrfCookie();

      const { response, data } = await loginUser({
        email: loginEmail,
        password: loginPassword,
      });

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

  async function handleRegister(event) {
    event.preventDefault();

    if (registerPassword !== registerPasswordConfirmation) {
      showMessage("Passwords do not match.", "error");
      return;
    }

    showMessage("Creating account...");

    try {
      await requestCsrfCookie();

      const { response, data } = await registerUser({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
        passwordConfirmation: registerPasswordConfirmation,
      });

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

  async function handleLogout() {
    try {
      const response = await logoutUser();

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

  // ---- Posts actions ----------------------------------------------------

  async function getPosts() {
    setLoadingPosts(true);
    setPostsError("");

    try {
      const response = await fetchPosts();

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

      setPosts(parsePostList(data));
    } catch (error) {
      console.error(error);

      setPostsError("Cannot connect to Laravel.");
    } finally {
      setLoadingPosts(false);
    }
  }

  async function handleCreatePost(event) {
    event.preventDefault();

    const title = postTitle.trim();
    const body = postBody.trim();

    if (!title || !body) {
      return;
    }

    try {
      const response = await createPost({ title, body });

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

  async function handleUpdatePost(event) {
    event.preventDefault();

    if (!editingPost) {
      return;
    }

    try {
      const response = await updatePost(editingPost.id, {
        title: editTitle.trim(),
        body: editBody.trim(),
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

  async function handleDeletePost(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await deletePost(id);

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

  // ---- Public API -------------------------------------------------------

  return {
    // Session
    user,
    token,
    // Auth screen
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
  };
}
