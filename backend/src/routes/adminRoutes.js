import express from "express";
import mongoose from "mongoose";
import { protect, requireRole } from "../middleware/auth.js";
import Entrepreneur from "../models/Entrepreneur.js";
import { asyncHandler, HttpError } from "../utils/httpError.js";

const router = express.Router();

router.get(
  "/entrepreneurs/pending",
  protect,
  requireRole("admin"),
  asyncHandler(async (_req, res) => {
    const pending = await Entrepreneur.find({ isApproved: false })
      .populate("user", "name email location role")
      .sort({ createdAt: 1 })
      .limit(100);

    return res.json(pending);
  })
);

router.patch(
  "/entrepreneurs/:id/approve",
  protect,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new HttpError(400, "Invalid entrepreneur id");
    }

    const updated = await Entrepreneur.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true, runValidators: true }
    ).populate("user", "name email location role");

    if (!updated) {
      throw new HttpError(404, "Entrepreneur profile not found");
    }

    return res.json({ message: "Approved", profile: updated });
  })
);

export default router;
