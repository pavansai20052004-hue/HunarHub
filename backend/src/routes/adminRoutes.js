import express from "express";
import { protect, requireRole } from "../middleware/auth.js";
import Entrepreneur from "../models/Entrepreneur.js";
import { asyncHandler, HttpError } from "../utils/httpError.js";

const router = express.Router();
const objectIdPattern = /^[0-9a-f]{24}$/i;

router.get(
  "/entrepreneurs/pending",
  protect,
  requireRole("admin"),
  asyncHandler(async (_req, res) => {
    const pending = await Entrepreneur.listPending();

    return res.json(pending);
  })
);

router.patch(
  "/entrepreneurs/:id/approve",
  protect,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    if (!objectIdPattern.test(req.params.id)) {
      throw new HttpError(400, "Invalid entrepreneur id");
    }

    const updated = await Entrepreneur.approve(req.params.id);

    if (!updated) {
      throw new HttpError(404, "Entrepreneur profile not found");
    }

    return res.json({ message: "Approved", profile: updated });
  })
);

export default router;
