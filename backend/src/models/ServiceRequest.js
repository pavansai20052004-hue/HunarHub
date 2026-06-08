import { query } from "../config/db.js";

const toNumber = (value) => (value === null || value === undefined ? value : Number(value));

const mapCustomer = (row) =>
  row?.customer_id
    ? {
        _id: row.customer_id,
        id: row.customer_id,
        name: row.customer_name,
        email: row.customer_email,
      }
    : undefined;

const mapEntrepreneur = (row) =>
  row?.entrepreneur_id
    ? {
        _id: row.entrepreneur_id,
        id: row.entrepreneur_id,
        category: row.entrepreneur_category,
        bio: row.entrepreneur_bio,
        experienceYears: row.entrepreneur_experience_years,
        minPrice: toNumber(row.entrepreneur_min_price),
        maxPrice: toNumber(row.entrepreneur_max_price),
        isApproved: row.entrepreneur_is_approved,
        user: {
          _id: row.entrepreneur_user_id,
          id: row.entrepreneur_user_id,
          name: row.entrepreneur_user_name,
          location: row.entrepreneur_user_location,
        },
      }
    : undefined;

const mapRequest = (row) =>
  row
    ? {
        _id: row.id,
        id: row.id,
        customer: mapCustomer(row) || row.customer_id,
        entrepreneur: mapEntrepreneur(row) || row.entrepreneur_id,
        serviceType: row.service_type,
        description: row.description,
        preferredDate: row.preferred_date,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }
    : null;

const baseSelect = `
  SELECT
    sr.*,
    c.id AS customer_id,
    c.name AS customer_name,
    c.email AS customer_email,
    e.id AS entrepreneur_id,
    e.category AS entrepreneur_category,
    e.bio AS entrepreneur_bio,
    e.experience_years AS entrepreneur_experience_years,
    e.min_price AS entrepreneur_min_price,
    e.max_price AS entrepreneur_max_price,
    e.is_approved AS entrepreneur_is_approved,
    u.id AS entrepreneur_user_id,
    u.name AS entrepreneur_user_name,
    u.location AS entrepreneur_user_location
  FROM service_requests sr
  JOIN users c ON c.id = sr.customer_id
  JOIN entrepreneurs e ON e.id = sr.entrepreneur_id
  JOIN users u ON u.id = e.user_id
`;

const ServiceRequest = {
  async create({ customer, entrepreneur, serviceType, description, preferredDate }) {
    const { rows } = await query(
      `INSERT INTO service_requests (customer_id, entrepreneur_id, service_type, description, preferred_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [customer, entrepreneur, serviceType, description, preferredDate]
    );

    return this.findById(rows[0].id);
  },

  async findById(id) {
    const { rows } = await query(`${baseSelect} WHERE sr.id = $1 LIMIT 1`, [id]);
    return mapRequest(rows[0]);
  },

  async listByCustomer(customerId) {
    const { rows } = await query(
      `${baseSelect}
       WHERE sr.customer_id = $1
       ORDER BY sr.created_at DESC`,
      [customerId]
    );

    return rows.map(mapRequest);
  },

  async listByEntrepreneur(entrepreneurId) {
    const { rows } = await query(
      `${baseSelect}
       WHERE sr.entrepreneur_id = $1
       ORDER BY sr.created_at DESC`,
      [entrepreneurId]
    );

    return rows.map(mapRequest);
  },

  async updateStatus(id, status) {
    const { rows } = await query(
      `UPDATE service_requests
       SET status = $2
       WHERE id = $1
       RETURNING id`,
      [id, status]
    );

    if (!rows[0]) return null;
    return this.findById(rows[0].id);
  },
};

export default ServiceRequest;
