import express from "express";
import mongoose from "mongoose";
import Entrepreneur from "../models/Entrepreneur.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/entrepreneurs/pending", protect, requireRole("admin"), async (req, res) => {
  try {
    const pending = await Entrepreneur.find({ isApproved: false })
      .populate("user", "name email location role")
      .sort({ createdAt: 1 });

    return res.json(pending);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/entrepreneurs/:id/approve", protect, requireRole("admin"), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid entrepreneur id" });
    }

    const updated = await Entrepreneur.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true, runValidators: true }
    ).populate("user", "name email location role");

    if (!updated) {
      return res.status(404).json({ message: "Entrepreneur profile not found" });
    }

    return res.json({ message: "Approved", profile: updated });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
