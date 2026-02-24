import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="nav">
      <div className="navInner">
        <Link to="/" className="brand">
          <span className="brandDot" />
          <span>HunarHub</span>
          <span className="small">• Marketplace</span>
        </Link>

        <div className="navLinks">
          <Link className="pill" to="/">Home</Link>

          {user?.role === "customer" && (
            <>
              <Link className="pill" to="/customer">Explore</Link>
              <Link className="pill" to="/my-requests">My Requests</Link>
            </>
          )}

          {user?.role === "entrepreneur" && (
            <>
              <Link className="pill" to="/entrepreneur/profile">My Profile</Link>
              <Link className="pill" to="/entrepreneur/requests">Requests</Link>
            </>
          )}

          {user?.role === "admin" && (
            <Link className="pill" to="/admin">Admin</Link>
          )}
        </div>

        <div className="spacer" />

        {token && user ? (
          <div className="userChip">
            <span className="small">{user.name}</span>
            <span className="badge">{user.role}</span>
            <button className="btn btnDanger" onClick={logout}>Logout</button>
          </div>
        ) : (
          <div className="row">
            <Link className="pill" to="/login">Login</Link>
            <Link className="pill" to="/register">Register</Link>
          </div>
        )}
      </div>
    </div>
  );
}