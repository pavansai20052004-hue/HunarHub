import { Navigate } from "react-router-dom";
import { getStoredUser, getToken } from "./utils/session";

export default function ProtectedRoute({ children, allowedRoles, allowRoles }) {
  const token = getToken();
  const user = getStoredUser();
  const roles = allowedRoles || allowRoles || [];

  if (!token || !user) return <Navigate to="/login" replace />;

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
