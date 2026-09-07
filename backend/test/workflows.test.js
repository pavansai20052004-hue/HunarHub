import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

// Run the real schema, models, HTTP routes, bcrypt and JWT against isolated MongoDB.
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-only-secret-with-more-than-32-characters";
process.env.FRONTEND_URL = "https://frontend-two-henna-78.vercel.app";
process.env.BCRYPT_ROUNDS = "4";
process.env.ADMIN_EMAIL = "admin@example.test";
process.env.ADMIN_PASSWORD = "test-admin-password";
process.env.RATE_LIMIT_MAX = "10000";

let server, base, db, mongo;
before(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri("hunarhub_test");
  db = await import("../src/config/db.js");
  await db.connectDB();
  const { default: app } = await import("../src/app.js");
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  if (db) await db.disconnectDB();
  await mongo.stop();
});
async function api(path, { method = "GET", body, token, headers = {} } = {}) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, data: response.status === 204 ? null : await response.json(), headers: response.headers };
}
async function register(email, role = "customer") {
  const result = await api("/api/auth/register", { method: "POST", body: {
    name: "Test Person", email, password: "test-password", role, location: "Hyderabad",
  } });
  assert.equal(result.status, 201, JSON.stringify(result.data));
  assert.ok(result.data.token);
  assert.equal(result.data.user.password, undefined);
  return result.data;
}

test("health confirms the database connection", async () => {
  assert.equal((await api("/health")).status, 200);
});

test("registration, normalized login, invalid inputs and access control", async () => {
  await register("  CUSTOMER@EXAMPLE.TEST  ");
  const login = await api("/api/auth/login", { method: "POST", body: { email: " CUSTOMER@example.test ", password: "test-password" } });
  assert.equal(login.status, 200);
  assert.equal(login.data.user.role, "customer");
  const saved = await mongoose.connection.collection("users").findOne({ email: "customer@example.test" });
  assert.notEqual(saved.password, "test-password");
  assert.equal((await api("/api/auth/login", { method: "POST", body: { email: "customer@example.test", password: "wrong" } })).status, 401);
  for (const body of [{}, { email: {}, password: [] }, { email: 42, password: "test-password" }]) {
    assert.equal((await api("/api/auth/login", { method: "POST", body })).status, 400);
  }
  for (const body of [
    { name: "A", email: "short@example.test", password: "test-password" },
    { name: "Test", email: "long@example.test", password: "a".repeat(73) },
  ]) {
    assert.equal((await api("/api/auth/register", { method: "POST", body })).status, 400);
  }
  assert.equal((await api("/api/auth/register", { method: "POST", body: { name: "Test", email: "customer@example.test", password: "test-password" } })).status, 409);
  const noAdmin = await register("noadmin@example.test", "admin");
  assert.equal(noAdmin.user.role, "customer");
  assert.equal((await api("/api/admin/entrepreneurs/pending", { token: login.data.token })).status, 403);
  assert.equal((await api("/api/requests/my")).status, 401);
  assert.equal((await api("/api/requests/my", { token: "invalid" })).status, 401);
});

test("customer → entrepreneur → admin approval → requests lifecycle", async () => {
  const customer = await register("workflow-customer@example.test");
  const other = await register("other-customer@example.test");
  const entrepreneur = await register("entrepreneur@example.test", "entrepreneur");
  const admin = await api("/api/auth/login", { method: "POST", body: { email: "admin@example.test", password: "test-admin-password" } });
  assert.equal(admin.status, 200);
  assert.equal((await api("/api/entrepreneurs/me", { token: entrepreneur.token })).status, 404);
  const profileResult = await api("/api/entrepreneurs", { method: "POST", token: entrepreneur.token, body: {
    category: "tailor", bio: "Clothing repairs", experienceYears: 2, minPrice: 50, maxPrice: 200,
  } });
  assert.equal(profileResult.status, 201);
  const profile = profileResult.data.profile;
  assert.equal((await api("/api/entrepreneurs")).data.length, 0);
  const pending = await api("/api/admin/entrepreneurs/pending", { token: admin.data.token });
  assert.equal(pending.data[0]._id, profile._id);
  assert.equal((await api(`/api/admin/entrepreneurs/${profile._id}/approve`, { method: "PATCH", token: admin.data.token })).status, 200);
  assert.equal((await api("/api/entrepreneurs?location=hyderabad&category=tailor&maxPrice=100")).data.length, 1);
  assert.equal((await api("/api/entrepreneurs?maxPrice=10")).data.length, 0);
  const makeRequest = () => api("/api/requests", { method: "POST", token: customer.token, body: { entrepreneurId: profile._id, serviceType: "Repair shirt" } });
  const request = await makeRequest();
  assert.equal(request.status, 201);
  const id = request.data._id;
  assert.equal((await api("/api/requests/my", { token: customer.token })).data.length, 1);
  assert.equal((await api("/api/requests/entrepreneur", { token: entrepreneur.token })).data.length, 1);
  assert.equal((await api(`/api/requests/${id}/cancel`, { method: "PATCH", token: other.token })).status, 403);
  assert.equal((await api(`/api/requests/${id}/status`, { method: "PATCH", token: entrepreneur.token, body: { status: "completed" } })).status, 400);
  assert.equal((await api(`/api/requests/${id}/status`, { method: "PATCH", token: entrepreneur.token, body: { status: "accepted" } })).data.request.status, "accepted");
  assert.equal((await api(`/api/requests/${id}/cancel`, { method: "PATCH", token: customer.token })).status, 400);
  assert.equal((await api(`/api/requests/${id}/status`, { method: "PATCH", token: entrepreneur.token, body: { status: "completed" } })).data.request.status, "completed");
  const cancelled = await makeRequest();
  assert.equal((await api(`/api/requests/${cancelled.data._id}/cancel`, { method: "PATCH", token: customer.token })).data.request.status, "cancelled");
  const rejected = await makeRequest();
  assert.equal((await api(`/api/requests/${rejected.data._id}/status`, { method: "PATCH", token: entrepreneur.token, body: { status: "rejected" } })).data.request.status, "rejected");
  const raced = await makeRequest();
  const { default: ServiceRequest } = await import("../src/models/ServiceRequest.js");
  const results = await Promise.all([
    ServiceRequest.updateStatus(raced.data._id, "accepted", "pending"),
    ServiceRequest.updateStatus(raced.data._id, "cancelled", "pending"),
  ]);
  assert.equal(results.filter(Boolean).length, 1);
});

test("CORS permits the configured frontend", async () => {
  const result = await api("/api/auth/login", { method: "OPTIONS", headers: {
    Origin: "https://frontend-two-henna-78.vercel.app", "Access-Control-Request-Method": "POST",
  } });
  assert.equal(result.status, 204);
  assert.equal(result.headers.get("access-control-allow-origin"), "https://frontend-two-henna-78.vercel.app");
});
