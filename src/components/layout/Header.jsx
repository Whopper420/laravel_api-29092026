export default function Header({ user, onLogout }) {
  return (
    <header className="header">
      <div className="container">
        <h1>Laravel Posts</h1>

        <div id="userArea">
          <span id="userInfo">
            {user
              ? `Logged in as ${user.name || user.email || "User"}`
              : "Not logged in"}
          </span>

          {user && <button onClick={onLogout}>Logout</button>}
        </div>
      </div>
    </header>
  );
}
