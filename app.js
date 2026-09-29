/*
==================================================
CONFIGURATION
==================================================
*/

const API_URL = "http://127.0.0.1:8000/api";
const BASE_URL = "http://127.0.0.1:8000";

/*
==================================================
HTML ELEMENTS
==================================================
*/

const authSection = document.getElementById("authSection");

const postsSection = document.getElementById("postsSection");

const loginForm = document.getElementById("loginForm");

const registerForm = document.getElementById("registerForm");

const showLoginBtn = document.getElementById("showLoginBtn");

const showRegisterBtn = document.getElementById("showRegisterBtn");

const authMessage = document.getElementById("authMessage");

const logoutBtn = document.getElementById("logoutBtn");

const userInfo = document.getElementById("userInfo");

const showPostsBtn = document.getElementById("showPostsBtn");

const postsContainer = document.getElementById("postsContainer");

const createPostForm = document.getElementById("createPostForm");

const editPostForm = document.getElementById("editPostForm");

const editContainer = document.getElementById("editContainer");

const cancelEditBtn = document.getElementById("cancelEditBtn");

/*
==================================================
HELPER: SHOW MESSAGE
==================================================
*/

function showAuthMessage(message, type = "") {
  authMessage.textContent = message;

  authMessage.className = type;
}

/*
==================================================
HELPER: REQUEST CSRF COOKIE
==================================================

Sanctum needs this before login.

GET:

/sanctum/csrf-cookie
*/

function getCsrfCookie() {
  return new Promise(function (resolve, reject) {
    const xhr = new XMLHttpRequest();

    xhr.open("GET", BASE_URL + "/sanctum/csrf-cookie", true);

    /*
        Important for Sanctum cookies.
        */

    xhr.withCredentials = true;

    xhr.onload = function () {
      console.log("CSRF status:", xhr.status);

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error("Could not get CSRF cookie."));
      }
    };

    xhr.onerror = function () {
      reject(new Error("Could not connect to Laravel."));
    };

    xhr.send();
  });
}

/*
==================================================
LOGIN
==================================================
*/

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value;

  const password = document.getElementById("loginPassword").value;

  showAuthMessage("Logging in...");

  try {
    /*
            First get Sanctum CSRF cookie.
            */

    await getCsrfCookie();

    const xhr = new XMLHttpRequest();

    xhr.open("POST", API_URL + "/login", true);

    /*
            VERY IMPORTANT

            Send Laravel cookies.
            */

    xhr.withCredentials = true;

    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.setRequestHeader("Accept", "application/json");

    xhr.onload = function () {
      console.log("LOGIN status:", xhr.status);

      console.log("LOGIN response:", xhr.responseText);

      if (xhr.status >= 200 && xhr.status < 300) {
        showAuthMessage("Login successful!", "success");

        loginForm.reset();

        /*
                    Get logged-in user.
                    */

        getCurrentUser();
      } else {
        let message = "Login failed.";

        try {
          const response = JSON.parse(xhr.responseText);

          if (response.message) {
            message = response.message;
          }

          if (response.errors) {
            console.error(response.errors);
          }
        } catch (error) {
          console.error("Invalid JSON:", error);
        }

        showAuthMessage(message, "error");
      }
    };

    xhr.onerror = function () {
      showAuthMessage("Cannot connect to Laravel.", "error");
    };

    xhr.send(
      JSON.stringify({
        email: email,
        password: password,
      }),
    );
  } catch (error) {
    console.error(error);

    showAuthMessage(error.message, "error");
  }
});

/*
==================================================
REGISTER
==================================================
*/

registerForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const name = document.getElementById("registerName").value;

  const email = document.getElementById("registerEmail").value;

  const password = document.getElementById("registerPassword").value;

  const passwordConfirmation = document.getElementById(
    "registerPasswordConfirmation",
  ).value;

  if (password !== passwordConfirmation) {
    showAuthMessage("Passwords do not match.", "error");

    return;
  }

  showAuthMessage("Creating account...");

  try {
    await getCsrfCookie();

    const xhr = new XMLHttpRequest();

    xhr.open("POST", API_URL + "/register", true);

    xhr.withCredentials = true;

    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.setRequestHeader("Accept", "application/json");

    xhr.onload = function () {
      console.log("REGISTER status:", xhr.status);

      console.log("REGISTER response:", xhr.responseText);

      if (xhr.status >= 200 && xhr.status < 300) {
        showAuthMessage("Registration successful!", "success");

        registerForm.reset();

        /*
                    If registration logs the
                    user in automatically,
                    get the user.
                    */

        getCurrentUser();
      } else {
        let message = "Registration failed.";

        try {
          const response = JSON.parse(xhr.responseText);

          if (response.message) {
            message = response.message;
          }
        } catch (error) {
          console.error(error);
        }

        showAuthMessage(message, "error");
      }
    };

    xhr.onerror = function () {
      showAuthMessage("Cannot connect to Laravel.", "error");
    };

    xhr.send(
      JSON.stringify({
        name: name,

        email: email,

        password: password,

        password_confirmation: passwordConfirmation,
      }),
    );
  } catch (error) {
    console.error(error);

    showAuthMessage(error.message, "error");
  }
});

/*
==================================================
GET CURRENT USER
==================================================

GET /api/user
*/

function getCurrentUser() {
  const xhr = new XMLHttpRequest();

  xhr.open("GET", API_URL + "/user", true);

  /*
    Send Sanctum cookie.
    */

  xhr.withCredentials = true;

  xhr.setRequestHeader("Accept", "application/json");

  xhr.onload = function () {
    console.log("USER status:", xhr.status);

    console.log("USER response:", xhr.responseText);

    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        const user = JSON.parse(xhr.responseText);

        /*
                Laravel might return:

                {
                    id: 1,
                    name: "John",
                    email: "..."
                }

                */

        userInfo.textContent =
          "Logged in as " + (user.name || user.email || "User");

        authSection.classList.add("hidden");

        postsSection.classList.remove("hidden");

        logoutBtn.classList.remove("hidden");

        /*
                Automatically load posts.
                */

        getPosts();
      } catch (error) {
        console.error("User JSON error:", error);
      }
    } else {
      /*
            User is not authenticated.
            */

      showLoggedOutState();
    }
  };

  xhr.onerror = function () {
    console.error("Cannot connect to Laravel.");

    showLoggedOutState();
  };

  xhr.send();
}

/*
==================================================
LOGOUT
==================================================
*/

logoutBtn.addEventListener("click", function () {
  const xhr = new XMLHttpRequest();

  xhr.open("POST", API_URL + "/logout", true);

  xhr.withCredentials = true;

  xhr.setRequestHeader("Accept", "application/json");

  xhr.onload = function () {
    console.log("LOGOUT status:", xhr.status);

    if (xhr.status >= 200 && xhr.status < 300) {
      showLoggedOutState();

      showAuthMessage("You have been logged out.");
    } else {
      console.error(xhr.responseText);
    }
  };

  xhr.onerror = function () {
    alert("Could not connect to Laravel.");
  };

  xhr.send();
});

/*
==================================================
SHOW LOGGED OUT STATE
==================================================
*/

function showLoggedOutState() {
  authSection.classList.remove("hidden");

  postsSection.classList.add("hidden");

  logoutBtn.classList.add("hidden");

  userInfo.textContent = "Not logged in";

  postsContainer.innerHTML = "<p>Please log in to manage posts.</p>";

  editContainer.classList.add("hidden");
}

/*
==================================================
LOGIN / REGISTER TABS
==================================================
*/

showLoginBtn.addEventListener("click", function () {
  loginForm.classList.remove("hidden");

  registerForm.classList.add("hidden");

  showLoginBtn.classList.add("active");

  showRegisterBtn.classList.remove("active");

  showAuthMessage("");
});

showRegisterBtn.addEventListener("click", function () {
  registerForm.classList.remove("hidden");

  loginForm.classList.add("hidden");

  showRegisterBtn.classList.add("active");

  showLoginBtn.classList.remove("active");

  showAuthMessage("");
});

/*
==================================================
GET ALL POSTS
==================================================

GET /api/posts

This route is public according
to your PostController.
*/

showPostsBtn.addEventListener("click", getPosts);

function getPosts() {
  postsContainer.innerHTML = '<p class="loading">Loading posts...</p>';

  const xhr = new XMLHttpRequest();

  xhr.open("GET", API_URL + "/posts", true);

  xhr.withCredentials = true;

  xhr.setRequestHeader("Accept", "application/json");

  xhr.onload = function () {
    console.log("GET status:", xhr.status);

    console.log("GET response:", xhr.responseText);

    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        const response = JSON.parse(xhr.responseText);

        let posts = [];

        /*
                Laravel can return:

                [
                    {...}
                ]

                OR

                {
                    data: [...]
                }
                */

        if (Array.isArray(response)) {
          posts = response;
        } else if (response.data && Array.isArray(response.data)) {
          posts = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          posts = response.data.data;
        }

        displayPosts(posts);
      } catch (error) {
        console.error("JSON error:", error);

        postsContainer.innerHTML =
          '<p class="error">' + "Invalid JSON response." + "</p>";
      }
    } else {
      postsContainer.innerHTML =
        '<p class="error">' + "API Error: " + xhr.status + "</p>";
    }
  };

  xhr.onerror = function () {
    postsContainer.innerHTML =
      '<p class="error">' + "Cannot connect to Laravel." + "</p>";
  };

  xhr.send();
}

/*
==================================================
DISPLAY POSTS
==================================================
*/

function displayPosts(posts) {
  postsContainer.innerHTML = "";

  if (posts.length === 0) {
    postsContainer.innerHTML = "<p>No posts found.</p>";

    return;
  }

  posts.forEach(function (post) {
    const article = document.createElement("article");

    article.className = "post";

    /*
        TITLE
        */

    const title = document.createElement("h2");

    title.textContent = post.title || "No title";

    /*
        BODY
        */

    const body = document.createElement("p");

    body.textContent = post.body || "No body";

    /*
        ID
        */

    const id = document.createElement("small");

    id.className = "post-id";

    id.textContent = "Post ID: " + post.id;

    /*
        EDIT BUTTON
        */

    const editButton = document.createElement("button");

    editButton.textContent = "Edit";

    editButton.addEventListener("click", function () {
      openEditForm(post);
    });

    /*
        DELETE BUTTON
        */

    const deleteButton = document.createElement("button");

    deleteButton.textContent = "Delete";

    deleteButton.className = "delete";

    deleteButton.addEventListener("click", function () {
      deletePost(post.id);
    });

    /*
        ADD ELEMENTS
        */

    article.appendChild(title);

    article.appendChild(body);

    article.appendChild(id);

    article.appendChild(editButton);

    article.appendChild(deleteButton);

    postsContainer.appendChild(article);
  });
}

/*
==================================================
CREATE POST
==================================================

POST /api/posts
*/

createPostForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const title = document.getElementById("postTitle").value.trim();

  const body = document.getElementById("postBody").value.trim();

  const xhr = new XMLHttpRequest();

  xhr.open("POST", API_URL + "/posts", true);

  /*
        VERY IMPORTANT

        Send the Sanctum session cookie.
        */

  xhr.withCredentials = true;

  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.setRequestHeader("Accept", "application/json");

  xhr.onload = function () {
    console.log("CREATE status:", xhr.status);

    console.log("CREATE response:", xhr.responseText);

    if (xhr.status >= 200 && xhr.status < 300) {
      alert("Post created!");

      createPostForm.reset();

      getPosts();
    } else {
      console.error(xhr.responseText);

      alert("Could not create post. " + "HTTP " + xhr.status);
    }
  };

  xhr.onerror = function () {
    alert("Could not connect to Laravel.");
  };

  xhr.send(
    JSON.stringify({
      title: title,

      body: body,
    }),
  );
});

/*
==================================================
OPEN EDIT FORM
==================================================
*/

function openEditForm(post) {
  editContainer.classList.remove("hidden");

  document.getElementById("editPostId").value = post.id;

  document.getElementById("editPostTitle").value = post.title || "";

  document.getElementById("editPostBody").value = post.body || "";

  editContainer.scrollIntoView({
    behavior: "smooth",
  });
}

/*
==================================================
UPDATE POST
==================================================

PUT /api/posts/{id}
*/

editPostForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const id = document.getElementById("editPostId").value;

  const title = document.getElementById("editPostTitle").value.trim();

  const body = document.getElementById("editPostBody").value.trim();

  const xhr = new XMLHttpRequest();

  xhr.open("PUT", API_URL + "/posts/" + id, true);

  xhr.withCredentials = true;

  xhr.setRequestHeader("Content-Type", "application/json");

  xhr.setRequestHeader("Accept", "application/json");

  xhr.onload = function () {
    console.log("UPDATE status:", xhr.status);

    console.log("UPDATE response:", xhr.responseText);

    if (xhr.status >= 200 && xhr.status < 300) {
      alert("Post updated!");

      editPostForm.reset();

      editContainer.classList.add("hidden");

      getPosts();
    } else {
      alert("Could not update post. " + "HTTP " + xhr.status);
    }
  };

  xhr.onerror = function () {
    alert("Could not connect to Laravel.");
  };

  xhr.send(
    JSON.stringify({
      title: title,

      body: body,
    }),
  );
});

/*
==================================================
CANCEL EDIT
==================================================
*/

cancelEditBtn.addEventListener("click", function () {
  editContainer.classList.add("hidden");

  editPostForm.reset();
});

/*
==================================================
DELETE POST
==================================================

DELETE /api/posts/{id}
*/

function deletePost(id) {
  const confirmed = confirm("Are you sure you want to delete this post?");

  if (!confirmed) {
    return;
  }

  const xhr = new XMLHttpRequest();

  xhr.open("DELETE", API_URL + "/posts/" + id, true);

  xhr.withCredentials = true;

  xhr.setRequestHeader("Accept", "application/json");

  xhr.onload = function () {
    console.log("DELETE status:", xhr.status);

    console.log("DELETE response:", xhr.responseText);

    if (xhr.status >= 200 && xhr.status < 300) {
      alert("Post deleted!");

      getPosts();
    } else {
      alert("Could not delete post. " + "HTTP " + xhr.status);
    }
  };

  xhr.onerror = function () {
    alert("Could not connect to Laravel.");
  };

  xhr.send();
}

/*
==================================================
CHECK LOGIN WHEN PAGE LOADS
==================================================
*/

getCurrentUser();
