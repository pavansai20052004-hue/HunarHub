import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, expect, test, vi } from "vitest";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./ProtectedRoute";
import api from "./pages/api";
import { saveSession } from "./utils/session";

vi.mock("./pages/api", () => ({ default: { post: vi.fn() } }));
afterEach(() => { cleanup(); localStorage.clear(); vi.resetAllMocks(); });
const user = (role) => ({ id: "test-user", name: "Test", email: "test@example.test", role });
function showAuth(Component) {
  render(<MemoryRouter initialEntries={["/auth"]}><Routes>
    <Route path="/auth" element={<Component />} />
    {["customer", "entrepreneur", "admin"].map((role) => <Route key={role} path={`/${role}`} element={<ProtectedRoute allowedRoles={[role]}><h1>{role} dashboard</h1></ProtectedRoute>} />)}
  </Routes></MemoryRouter>);
}
test.each(["customer", "entrepreneur", "admin"])("login saves session and opens %s dashboard", async (role) => {
  api.post.mockResolvedValue({ data: { token: "test-token", user: user(role) } });
  showAuth(Login);
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "TEST@example.test" } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "test-password" } });
  fireEvent.click(screen.getByRole("button", { name: "Login" }));
  expect(await screen.findByText(`${role} dashboard`)).toBeInTheDocument();
  expect(api.post).toHaveBeenCalledWith("/auth/login", { email: "test@example.test", password: "test-password" });
  expect(localStorage.getItem("token")).toBe("test-token");
});
test("invalid credentials stay on login with a visible error", async () => {
  api.post.mockRejectedValue({ response: { data: { message: "Invalid credentials" } } });
  showAuth(Login);
  fireEvent.submit(screen.getByRole("button", { name: "Login" }).closest("form"));
  expect(await screen.findByRole("alert")).toHaveTextContent("Invalid credentials");
  expect(localStorage.getItem("token")).toBeNull();
});
test("malformed auth response cannot create a broken session", () => {
  expect(() => saveSession({ token: "token", user: {} })).toThrow("invalid login response");
  expect(localStorage.getItem("token")).toBeNull();
});
test("registration signs entrepreneur in and opens studio", async () => {
  api.post.mockResolvedValue({ data: { token: "test-token", user: user("entrepreneur") } });
  showAuth(Register);
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Test Person" } });
  fireEvent.change(screen.getByLabelText("Email"), { target: { value: "test@example.test" } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "test-password" } });
  fireEvent.change(screen.getByLabelText("Role"), { target: { value: "entrepreneur" } });
  fireEvent.click(screen.getByRole("button", { name: "Register" }));
  expect(await screen.findByText("entrepreneur dashboard")).toBeInTheDocument();
});
