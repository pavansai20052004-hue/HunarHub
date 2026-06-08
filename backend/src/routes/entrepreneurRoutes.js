import express from "express";
import { protect, requireRole } from "../middleware/auth.js";
import Entrepreneur from "../models/Entrepreneur.js";
import { asyncHandler, HttpError } from "../utils/httpError.js";

const router = express.Router();
const categories = ["cobbler", "potter", "tailor", "artisan", "vendor"];

const toNonNegativeNumber = (value, fieldName) => {
  if (value === undefined || value === null || value === "") return 0;

  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    throw new HttpError(400, `${fieldName} must be a non-negative number`);
  }

  return number;
};

router.post(
  "/",
  protect,
  requireRole("entrepreneur"),
  asyncHandler(async (req, res) => {
    const payload = {
      category: req.body.category,
      bio: req.body.bio?.trim() || "",
      experienceYears: toNonNegativeNumber(req.body.experienceYears, "Experience"),
      minPrice: toNonNegativeNumber(req.body.minPrice, "Minimum price"),
      maxPrice: toNonNegativeNumber(req.body.maxPrice, "Maximum price"),
    };

    if (!categories.includes(payload.category)) {
      throw new HttpError(400, "Invalid category");
    }

    if (payload.maxPrice < payload.minPrice) {
      throw new HttpError(400, "Maximum price must be greater than or equal to minimum price");
    }

    const existing = await Entrepreneur.findByUserId(req.user.id);
    const profile = await Entrepreneur.upsertForUser(req.user.id, payload);

    return res.status(existing ? 200 : 201).json({
      message: existing ? "Profile updated" : "Profile created",
      profile,
    });
  })
);

router.get(
  "/me",
  protect,
  requireRole("entrepreneur"),
  asyncHandler(async (req, res) => {
    const profile = await Entrepreneur.findByUserId(req.user.id);

    if (!profile) {
      throw new HttpError(404, "Entrepreneur profile not found");
    }

    return res.json(profile);
  })
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { category, location, minPrice, maxPrice } = req.query;
    const filters = {};

    if (category) {
      if (!categories.includes(category)) {
        throw new HttpError(400, "Invalid category");
      }
      filters.category = category;
    }

    if (minPrice !== undefined && minPrice !== "") {
      filters.minPrice = toNonNegativeNumber(minPrice, "Minimum price");
    }

    if (maxPrice !== undefined && maxPrice !== "") {
      filters.maxPrice = toNonNegativeNumber(maxPrice, "Maximum price");
    }

    if (location) {
      filters.location = location.trim();
    }

    const entrepreneurs = await Entrepreneur.listApproved(filters);
    return res.json(entrepreneurs);
  })
);

export default router;
