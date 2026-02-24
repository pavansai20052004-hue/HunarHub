import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";

import ProtectedRoute from "./ProtectedRoute";

import Admin from "./pages/Admin";
import EntrepreneurDashboard from "./pages/EntrepreneurDashboard";
import EntrepreneurRequests from "./pages/EntrepreneurRequests";
import Customer from "./pages/Customer";
import MyRequests from "./pages/MyRequests";
import EntrepreneurProfile from "./pages/EntrepreneurProfile";
import Navbar from "./components/Navbar";

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Home */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* Customer */}
        <Route
          path="/customer"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <Customer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-requests"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <MyRequests />
            </ProtectedRoute>
          }
        />

        {/* Entrepreneur */}
        <Route
          path="/entrepreneur"
          element={
            <ProtectedRoute allowedRoles={["entrepreneur"]}>
              <EntrepreneurDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/entrepreneur/requests"
          element={
            <ProtectedRoute allowedRoles={["entrepreneur"]}>
              <EntrepreneurRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/entrepreneur/profile"
          element={
            <ProtectedRoute allowedRoles={["entrepreneur"]}>
              <EntrepreneurProfile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}