import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowRoles = [] }) {
  const token = localStorage.getItem("token");
  const rawUser = localStorage.getItem("user");

  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles.length > 0) {
    if (!rawUser) return <Navigate to="/login" replace />;

    try {
      const user = JSON.parse(rawUser);
      if (!allowedRoles.includes(user?.role)) {
        return <Navigate to="/" replace />;
      }
    } catch {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}