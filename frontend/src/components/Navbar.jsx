import { Link, NavLink, useNavigate } from "react-router-dom";
import { clearSession, getStoredUser, getToken } from "../utils/session";

export default function Navbar() {
  const navigate = useNavigate();
  const token = getToken();
  const user = getStoredUser();

  const logout = () => {
    clearSession();
    navigate("/login");
  };

  return (
    <header className="nav">
      <nav className="navInner" aria-label="Primary navigation">
        <Link to="/" className="brand">
          <span className="brandMark">HH</span>
          <span>HunarHub</span>
        </Link>

        <div className="navLinks">
          <NavLink className="navLink" to="/">
            Home
          </NavLink>

          {user?.role === "customer" && (
            <>
              <NavLink className="navLink" to="/customer">
                Explore
              </NavLink>
              <NavLink className="navLink" to="/my-requests">
                Requests
              </NavLink>
            </>
          )}

          {user?.role === "entrepreneur" && (
            <>
              <NavLink className="navLink" to="/entrepreneur">
                Studio
              </NavLink>
              <NavLink className="navLink" to="/entrepreneur/profile">
                Profile
              </NavLink>
              <NavLink className="navLink" to="/entrepreneur/requests">
                Requests
              </NavLink>
            </>
          )}

          {user?.role === "admin" && (
            <NavLink className="navLink" to="/admin">
              Admin
            </NavLink>
          )}
        </div>

        <div className="spacer" />

        {token && user ? (
          <div className="userChip">
            <span className="avatar">{user.name?.charAt(0)?.toUpperCase() || "U"}</span>
            <span className="userName">{user.name}</span>
            <span className="badge">{user.role}</span>
            <button className="btn btnGhost" onClick={logout}>
              Logout
            </button>
          </div>
        ) : (
          <div className="navActions">
            <Link className="btn btnGhost" to="/login">
              Login
            </Link>
            <Link className="btn btnPrimary" to="/register">
              Register
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
