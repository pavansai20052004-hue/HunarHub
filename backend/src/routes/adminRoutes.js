import express from "express";
import Entrepreneur from "../models/Entrepreneur.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Get all pending entrepreneurs
router.get("/entrepreneurs/pending", protect, requireRole("admin"), async (req, res) => {
  try {
    const pending = await Entrepreneur.find({ isApproved: false })
      .populate("user", "name email location role");
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Approve entrepreneur
router.patch("/entrepreneurs/:id/approve", protect, requireRole("admin"), async (req, res) => {
  try {
    const updated = await Entrepreneur.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).populate("user", "name email location role");

    if (!updated) {
      return res.status(404).json({ message: "Entrepreneur profile not found" });
    }

    res.json({ message: "Approved ✅", profile: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;