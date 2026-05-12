import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "./api";
import { getDashboardPath, saveSession } from "../utils/session";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
    location: "",
  });
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
      const { data } = await api.post("/auth/register", {
        ...form,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        location: form.location.trim(),
      });

      saveSession({ token: data.token, user: data.user });
      navigate(getDashboardPath(data.user.role), { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="authShell">
      <section className="authPanel">
        <div className="authAside">
          <div className="eyebrow">Join HunarHub</div>
          <h1>Build your local services network</h1>
          <p>Customers discover skilled entrepreneurs while entrepreneurs manage profiles and incoming work.</p>
        </div>

        <div className="authCard">
          <div className="sectionHeader">
            <p className="eyebrow">Create account</p>
            <h2>Start with the right role</h2>
          </div>

          {error && <div className="notice noticeError">{error}</div>}

          <form onSubmit={handleSubmit} className="formStack">
            <label className="field">
              <span className="label">Name</span>
              <input
                className="input"
                name="name"
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>

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
                minLength="6"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={handleChange}
                required
              />
            </label>

            <label className="field">
              <span className="label">Role</span>
              <select className="input select" name="role" value={form.role} onChange={handleChange}>
                <option value="customer">Customer</option>
                <option value="entrepreneur">Entrepreneur</option>
              </select>
            </label>

            <label className="field">
              <span className="label">Location</span>
              <input
                className="input"
                name="location"
                placeholder="Hyderabad"
                value={form.location}
                onChange={handleChange}
              />
            </label>

            <button className="btn btnPrimary btnWide" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <p className="authSwitch">
            Already registered? <Link to="/login">Login</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
