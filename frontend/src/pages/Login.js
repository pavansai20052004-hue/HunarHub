import { useState } from "react";
import api from "./api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", form);

      alert("Login Success ✅");

      // save token
      localStorage.setItem("token", res.data.token);

      // optional: save user also
      localStorage.setItem("user", JSON.stringify(res.data.user));
     
      // role based redirect
if (res.data.user.role === "admin") {
  navigate("/admin");
} else if (res.data.user.role === "entrepreneur") {
  navigate("/entrepreneur");
} else {
  navigate("/");
}
      navigate("/"); // go home
    } catch (error) {
      alert(error?.response?.data?.message || "Login failed");
      console.log(error);
    }
  };

return (
  <div className="container">
    <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
      <div className="cardHeader">
        <h2 className="cardTitle">Login</h2>
        <p className="cardSub">Access your dashboard with role-based navigation.</p>
      </div>

      <div className="cardBody">
        <form onSubmit={handleSubmit}>
          <div className="field">
            <div className="label">Email</div>
            <input className="input" name="email" placeholder="you@example.com" onChange={handleChange} />
          </div>

          <div className="field">
            <div className="label">Password</div>
            <input className="input" name="password" type="password" placeholder="••••••••" onChange={handleChange} />
          </div>

          <button className="btn btnPrimary" type="submit" style={{ width: "100%" }}>
            Login
          </button>
        </form>
      </div>

      <div className="cardFooter">
        <div className="small">Tip: If role mismatch, clear localStorage and login again.</div>
      </div>
    </div>
  </div>
);
}