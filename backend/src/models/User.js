import { query } from "../config/db.js";

const mapUser = (row) =>
  row
    ? {
        _id: row.id,
        id: row.id,
        name: row.name,
        email: row.email,
        password: row.password,
        role: row.role,
        location: row.location,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }
    : null;

const User = {
  async existsByEmail(email) {
    const { rowCount } = await query("SELECT 1 FROM users WHERE email = $1 LIMIT 1", [email]);
    return rowCount > 0;
  },

  async create({ name, email, password, role, location }) {
    const { rows } = await query(
      `INSERT INTO users (name, email, password, role, location)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, email, password, role, location]
    );

    return mapUser(rows[0]);
  },

  async findByEmail(email) {
    const { rows } = await query("SELECT * FROM users WHERE email = $1 LIMIT 1", [email]);
    return mapUser(rows[0]);
  },
};

export default User;
