import bcrypt from "bcryptjs";
import pg from "pg";
import { config, isProduction } from "./env.js";

const { Pool } = pg;

let pool;
let dbState = "disconnected";

const shouldUseSsl = () =>
  isProduction || /neon\.tech/i.test(config.databaseUrl || "") || /sslmode=/i.test(config.databaseUrl || "");

const sslConfig = () => {
  if (!shouldUseSsl()) return undefined;
  if (/sslmode=verify-full/i.test(config.databaseUrl || "")) return { rejectUnauthorized: true };
  return { rejectUnauthorized: false };
};

const createPool = () =>
  new Pool({
    connectionString: config.databaseUrl,
    ssl: sslConfig(),
    max: config.dbPoolMax,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

const schemaSql = `
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(trim(name)) >= 2),
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'entrepreneur', 'admin')),
  location TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS entrepreneurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('cobbler', 'potter', 'tailor', 'artisan', 'vendor')),
  bio TEXT NOT NULL DEFAULT '' CHECK (char_length(bio) <= 500),
  experience_years INTEGER NOT NULL DEFAULT 0 CHECK (experience_years >= 0),
  min_price NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (min_price >= 0),
  max_price NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (max_price >= 0),
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (max_price >= min_price)
);

CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entrepreneur_id UUID NOT NULL REFERENCES entrepreneurs(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL CHECK (char_length(trim(service_type)) BETWEEN 1 AND 100),
  description TEXT NOT NULL DEFAULT '' CHECK (char_length(description) <= 1000),
  preferred_date TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS entrepreneurs_set_updated_at ON entrepreneurs;
CREATE TRIGGER entrepreneurs_set_updated_at
BEFORE UPDATE ON entrepreneurs
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS service_requests_set_updated_at ON service_requests;
CREATE TRIGGER service_requests_set_updated_at
BEFORE UPDATE ON service_requests
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS users_role_created_at_idx ON users(role, created_at DESC);
CREATE INDEX IF NOT EXISTS entrepreneurs_approved_category_updated_idx ON entrepreneurs(is_approved, category, updated_at DESC);
CREATE INDEX IF NOT EXISTS service_requests_customer_created_idx ON service_requests(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS service_requests_entrepreneur_status_created_idx ON service_requests(entrepreneur_id, status, created_at DESC);
`;

const seedAdmin = async (client) => {
  if (!config.adminEmail || !config.adminPassword) return;

  const password = await bcrypt.hash(config.adminPassword, config.bcryptRounds);

  await client.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email)
     DO UPDATE SET
       name = EXCLUDED.name,
       password = EXCLUDED.password,
       role = 'admin'`,
    [config.adminName, config.adminEmail, password]
  );
};

export const connectDB = async () => {
  dbState = "connecting";
  pool = createPool();

  try {
    const client = await pool.connect();
    try {
      await client.query(schemaSql);
      await seedAdmin(client);
      const { rows } = await client.query("SELECT current_database() AS database, inet_server_addr() AS host");
      dbState = "connected";
      console.log(`Postgres Connected: ${rows[0].database}`);
      return pool;
    } finally {
      client.release();
    }
  } catch (error) {
    dbState = "disconnected";
    await pool.end().catch(() => {});
    pool = undefined;
    throw error;
  }
};

export const disconnectDB = async () => {
  if (pool) {
    dbState = "disconnecting";
    await pool.end();
    pool = undefined;
  }

  dbState = "disconnected";
};

export const query = (text, params) => {
  if (!pool) {
    throw new Error("Database pool has not been initialized");
  }

  return pool.query(text, params);
};

export const getDbState = () => dbState;
