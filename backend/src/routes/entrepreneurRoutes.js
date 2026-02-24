import express from "express";
import Entrepreneur from "../models/Entrepreneur.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();

/**
 * ENTREPRENEUR: Create or Update my profile
 * POST /api/entrepreneurs
 */
router.post("/", protect, requireRole("entrepreneur"), async (req, res) => {
  try {
    const { category, bio, experienceYears, minPrice, maxPrice } = req.body;

    // If profile already exists for this user -> update
    const existing = await Entrepreneur.findOne({ user: req.user.id });

    if (existing) {
      existing.category = category ?? existing.category;
      existing.bio = bio ?? existing.bio;
      existing.experienceYears = experienceYears ?? existing.experienceYears;
      existing.minPrice = minPrice ?? existing.minPrice;
      existing.maxPrice = maxPrice ?? existing.maxPrice;

      // If entrepreneur edits profile again, you can optionally require re-approval:
      // existing.isApproved = false;

      await existing.save();
      return res.json({ message: "Profile updated ✅", profile: existing });
    }

    // Else create new profile
    const profile = await Entrepreneur.create({
      user: req.user.id,
      category,
      bio,
      experienceYears,
      minPrice,
      maxPrice,
      isApproved: false, // make sure default is false
    });

    res.status(201).json({ message: "Profile created ✅", profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ENTREPRENEUR: Get my profile
 * GET /api/entrepreneurs/me
 */
router.get("/me", protect, requireRole("entrepreneur"), async (req, res) => {
  try {
    const profile = await Entrepreneur.findOne({ user: req.user.id }).populate(
      "user",
      "name location"
    );

    if (!profile) {
      return res.status(404).json({ message: "Entrepreneur profile not found" });
    }

    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * PUBLIC/CUSTOMER: Get all approved entrepreneurs
 * GET /api/entrepreneurs
 */
router.get("/", async (req, res) => {
  try {
    const { category, location, minPrice, maxPrice } = req.query;

    let filter = { isApproved: true };

    if (category) filter.category = category;

    // Better pricing logic:
    // - if customer gives minPrice => entrepreneur.maxPrice >= minPrice
    // - if customer gives maxPrice => entrepreneur.minPrice <= maxPrice
    if (minPrice) filter.maxPrice = { $gte: Number(minPrice) };
    if (maxPrice) filter.minPrice = { $lte: Number(maxPrice) };

    const entrepreneurs = await Entrepreneur.find(filter).populate(
      "user",
      "name location"
    );

    if (location) {
      const filtered = entrepreneurs.filter((e) =>
        (e.user?.location || "")
          .toLowerCase()
          .includes(location.toLowerCase())
      );
      return res.json(filtered);
    }

    res.json(entrepreneurs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;