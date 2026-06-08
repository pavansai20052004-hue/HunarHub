import { query } from "../config/db.js";

const toNumber = (value) => (value === null || value === undefined ? value : Number(value));

const mapUser = (row) =>
  row?.user_id
    ? {
        _id: row.user_id,
        id: row.user_id,
        name: row.user_name,
        email: row.user_email,
        role: row.user_role,
        location: row.user_location,
      }
    : undefined;

const mapEntrepreneur = (row) =>
  row
    ? {
        _id: row.id,
        id: row.id,
        user: mapUser(row) || row.user_id,
        category: row.category,
        bio: row.bio,
        experienceYears: row.experience_years,
        minPrice: toNumber(row.min_price),
        maxPrice: toNumber(row.max_price),
        isApproved: row.is_approved,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }
    : null;

const baseSelect = `
  SELECT
    e.*,
    u.id AS user_id,
    u.name AS user_name,
    u.email AS user_email,
    u.role AS user_role,
    u.location AS user_location
  FROM entrepreneurs e
  JOIN users u ON u.id = e.user_id
`;

const Entrepreneur = {
  async upsertForUser(userId, payload) {
    const { rows } = await query(
      `INSERT INTO entrepreneurs (user_id, category, bio, experience_years, min_price, max_price, is_approved)
       VALUES ($1, $2, $3, $4, $5, $6, false)
       ON CONFLICT (user_id)
       DO UPDATE SET
         category = EXCLUDED.category,
         bio = EXCLUDED.bio,
         experience_years = EXCLUDED.experience_years,
         min_price = EXCLUDED.min_price,
         max_price = EXCLUDED.max_price
       RETURNING *`,
      [
        userId,
        payload.category,
        payload.bio,
        payload.experienceYears,
        payload.minPrice,
        payload.maxPrice,
      ]
    );

    return this.findById(rows[0].id);
  },

  async findByUserId(userId) {
    const { rows } = await query(`${baseSelect} WHERE e.user_id = $1 LIMIT 1`, [userId]);
    return mapEntrepreneur(rows[0]);
  },

  async findById(id) {
    const { rows } = await query(`${baseSelect} WHERE e.id = $1 LIMIT 1`, [id]);
    return mapEntrepreneur(rows[0]);
  },

  async listApproved({ category, minPrice, maxPrice, location }) {
    const clauses = ["e.is_approved = true"];
    const values = [];

    if (category) {
      values.push(category);
      clauses.push(`e.category = $${values.length}`);
    }

    if (minPrice !== undefined) {
      values.push(minPrice);
      clauses.push(`e.max_price >= $${values.length}`);
    }

    if (maxPrice !== undefined) {
      values.push(maxPrice);
      clauses.push(`e.min_price <= $${values.length}`);
    }

    if (location) {
      values.push(`%${location.toLowerCase()}%`);
      clauses.push(`lower(u.location) LIKE $${values.length}`);
    }

    const { rows } = await query(
      `${baseSelect}
       WHERE ${clauses.join(" AND ")}
       ORDER BY e.updated_at DESC
       LIMIT 100`,
      values
    );

    return rows.map(mapEntrepreneur);
  },

  async listPending() {
    const { rows } = await query(
      `${baseSelect}
       WHERE e.is_approved = false
       ORDER BY e.created_at ASC
       LIMIT 100`
    );

    return rows.map(mapEntrepreneur);
  },

  async approve(id) {
    const { rows } = await query(
      `UPDATE entrepreneurs
       SET is_approved = true
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (!rows[0]) return null;
    return this.findById(rows[0].id);
  },
};

export default Entrepreneur;
