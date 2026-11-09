import { useEffect, useState } from "react";

import { apiRequest, clearTokens } from "./api.js";

export default function App() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) return;
    apiRequest("/me/")
      .then(setUser)
      .catch((requestError) => {
        clearTokens();
        setUser(null);
        setError(requestError.message);
      });
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const tokens = await apiRequest("/auth/token/", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ username, password }),
      });
      localStorage.setItem("accessToken", tokens.access);
      localStorage.setItem("refreshToken", tokens.refresh);
      setUser(await apiRequest("/me/"));
      setPassword("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    clearTokens();
    setUser(null);
  }

  return (
    <main className="page-shell">
      <section className="auth-card" aria-labelledby="page-title">
        <div className="brand-mark" aria-hidden="true">T</div>
        <p className="eyebrow">TASK MANAGER</p>
        <h1 id="page-title">{user ? "You're signed in" : "Welcome back"}</h1>
        <p className="subtitle">
          {user
            ? "Your protected workspace is ready."
            : "Sign in to continue to your workspace."}
        </p>

        {user ? (
          <div className="signed-in-panel">
            <div className="avatar" aria-hidden="true">
              {user.username.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <strong>{user.username}</strong>
              <span>{user.email || "Authenticated user"}</span>
            </div>
            <button className="secondary-button" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="username">Username</label>
            <input
              autoComplete="username"
              id="username"
              name="username"
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Your username"
              required
              value={username}
            />

            <div className="password-label">
              <label htmlFor="password">Password</label>
            </div>
            <input
              autoComplete="current-password"
              id="password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
              type="password"
              value={password}
            />

            {error && <p className="error-message" role="alert">{error}</p>}

            <button className="primary-button" disabled={loading} type="submit">
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <span aria-hidden="true">→</span>}
            </button>
          </form>
        )}

        <p className="security-note">
          <span aria-hidden="true">●</span> Secure sign-in powered by JWT
        </p>
      </section>
      <footer>Simple, secure access to your work.</footer>
    </main>
  );
}
