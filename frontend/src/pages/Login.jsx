import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./api";
import { getDashboardPath, saveSession } from "../utils/session";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/auth/login", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      saveSession({ token: data.token, user: data.user });
      navigate(getDashboardPath(data.user.role), { replace: true });
    } catch (err) {
      setError(err.userMessage || err?.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="authShell">
      <section className="authPanel">
        <div className="authAside">
          <div className="eyebrow">HunarHub</div>
          <h1>Welcome back</h1>
          <p>Manage requests, approvals, and local service work from one focused dashboard.</p>
        </div>

        <div className="authCard">
          <div className="sectionHeader">
            <p className="eyebrow">Sign in</p>
            <h2>Access your workspace</h2>
          </div>

          {error && <div className="notice noticeError">{error}</div>}

          <form onSubmit={handleSubmit} className="formStack">
            <label className="field">
              <span className="label">Email</span>
              <input
                className="input"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>

            <label className="field">
              <span className="label">Password</span>
              <input
                className="input"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </label>

            <button className="btn btnPrimary btnWide" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="authSwitch">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
