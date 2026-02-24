import { useState } from "react";
import api from "./api";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
    location: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/register", form);
      alert("Registered Successfully 🚀");

      // Save token
      localStorage.setItem("token", res.data.token);

      console.log(res.data);
    } catch (error) {
      alert("Error registering");
      console.log(error);
    }
  };

  return (
  <div className="container">
    <div className="card" style={{ maxWidth: 560, margin: "0 auto" }}>
      <div className="cardHeader">
        <h2 className="cardTitle">Create Account</h2>
        <p className="cardSub">Choose role carefully: customer / entrepreneur / admin.</p>
      </div>

      <div className="cardBody">
        <form onSubmit={handleSubmit}>
          <div className="field">
            <div className="label">Name</div>
            <input className="input" name="name" placeholder="Your name" onChange={handleChange} />
          </div>

          <div className="field">
            <div className="label">Email</div>
            <input className="input" name="email" placeholder="you@example.com" onChange={handleChange} />
          </div>

          <div className="field">
            <div className="label">Password</div>
            <input className="input" name="password" type="password" placeholder="Min 6 chars" onChange={handleChange} />
          </div>

          <div className="field">
            <div className="label">Role</div>
            <select className="input select" name="role" onChange={handleChange} defaultValue="customer">
              <option value="customer">Customer</option>
              <option value="entrepreneur">Entrepreneur</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="field">
            <div className="label">Location</div>
            <input className="input" name="location" placeholder="Hyderabad" onChange={handleChange} />
          </div>

          <button className="btn btnPrimary" type="submit" style={{ width: "100%" }}>
            Register
          </button>
        </form>
      </div>
    </div>
  </div>
);
}