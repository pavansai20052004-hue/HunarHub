import express from "express";
import { protect, requireRole } from "../middleware/auth.js";
import Entrepreneur from "../models/Entrepreneur.js";
import { asyncHandler, HttpError } from "../utils/httpError.js";

const router = express.Router();
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
    if (!uuidPattern.test(req.params.id)) {
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
