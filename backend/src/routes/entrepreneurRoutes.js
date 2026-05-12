import express from "express";
import Entrepreneur from "../models/Entrepreneur.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();
const categories = ["cobbler", "potter", "tailor", "artisan", "vendor"];

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

router.post("/", protect, requireRole("entrepreneur"), async (req, res) => {
  try {
    const payload = {
      category: req.body.category,
      bio: req.body.bio?.trim() || "",
      experienceYears: toNumber(req.body.experienceYears),
      minPrice: toNumber(req.body.minPrice),
      maxPrice: toNumber(req.body.maxPrice),
    };

    if (!categories.includes(payload.category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    if (payload.experienceYears < 0 || payload.minPrice < 0 || payload.maxPrice < 0) {
      return res.status(400).json({ message: "Experience and prices cannot be negative" });
    }

    if (payload.maxPrice < payload.minPrice) {
      return res.status(400).json({ message: "maxPrice must be greater than or equal to minPrice" });
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
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/me", protect, requireRole("entrepreneur"), async (req, res) => {
  try {
    const profile = await Entrepreneur.findOne({ user: req.user.id }).populate(
      "user",
      "name location"
    );

    if (!profile) {
      return res.status(404).json({ message: "Entrepreneur profile not found" });
    }

    return res.json(profile);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { category, location, minPrice, maxPrice } = req.query;
    const filter = { isApproved: true };

    if (category) {
      if (!categories.includes(category)) {
        return res.status(400).json({ message: "Invalid category" });
      }
      filter.category = category;
    }

    if (minPrice) filter.maxPrice = { $gte: Number(minPrice) };
    if (maxPrice) filter.minPrice = { $lte: Number(maxPrice) };

    const entrepreneurs = await Entrepreneur.find(filter)
      .populate("user", "name location")
      .sort({ updatedAt: -1 });

    if (location) {
      const normalizedLocation = location.toLowerCase();
      return res.json(
        entrepreneurs.filter((entrepreneur) =>
          (entrepreneur.user?.location || "").toLowerCase().includes(normalizedLocation)
        )
      );
    }

    return res.json(entrepreneurs);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
