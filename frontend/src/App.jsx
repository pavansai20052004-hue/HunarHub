import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";

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
    <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <Navbar />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Admin />
            </ProtectedRoute>
          }
        />

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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
