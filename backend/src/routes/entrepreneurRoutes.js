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

    const existing = await Entrepreneur.findOne({ user: req.user.id });

    if (existing) {
      Object.assign(existing, payload);
      await existing.save();
      return res.json({ message: "Profile updated", profile: existing });
    }

    const profile = await Entrepreneur.create({
      ...payload,
      user: req.user.id,
      isApproved: false,
    });

    return res.status(201).json({ message: "Profile created", profile });
  })
);

router.get(
  "/me",
  protect,
  requireRole("entrepreneur"),
  asyncHandler(async (req, res) => {
    const profile = await Entrepreneur.findOne({ user: req.user.id }).populate(
      "user",
      "name location"
    );

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
    const filter = { isApproved: true };

    if (category) {
      if (!categories.includes(category)) {
        throw new HttpError(400, "Invalid category");
      }
      filter.category = category;
    }

    if (minPrice !== undefined && minPrice !== "") {
      filter.maxPrice = { $gte: toNonNegativeNumber(minPrice, "Minimum price") };
    }

    if (maxPrice !== undefined && maxPrice !== "") {
      filter.minPrice = { $lte: toNonNegativeNumber(maxPrice, "Maximum price") };
    }

    const entrepreneurs = await Entrepreneur.find(filter)
      .populate("user", "name location")
      .sort({ updatedAt: -1 })
      .limit(100);

    if (location) {
      const normalizedLocation = location.toLowerCase();
      return res.json(
        entrepreneurs.filter((entrepreneur) =>
          (entrepreneur.user?.location || "").toLowerCase().includes(normalizedLocation)
        )
      );
    }

    return res.json(entrepreneurs);
  })
);

export default router;
