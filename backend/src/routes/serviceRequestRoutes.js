import express from "express";
import ServiceRequest from "../models/ServiceRequest.js";
import Entrepreneur from "../models/Entrepreneur.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();

/**
 * CUSTOMER: Create a service request
 * POST /api/requests
 */
router.post("/", protect, requireRole("customer"), async (req, res) => {
  try {
    const { entrepreneurId, serviceType, description, preferredDate } = req.body;

    if (!entrepreneurId || !serviceType) {
      return res.status(400).json({ message: "entrepreneurId and serviceType are required" });
    }

    const entrepreneur = await Entrepreneur.findById(entrepreneurId);
    if (!entrepreneur || !entrepreneur.isApproved) {
      return res.status(404).json({ message: "Entrepreneur not found or not approved" });
    }

    const request = await ServiceRequest.create({
      customer: req.user.id,
      entrepreneur: entrepreneurId,
      serviceType,
      description: description || "",
      preferredDate: preferredDate || ""
    });

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * CUSTOMER: View my requests
 * GET /api/requests/my
 */
router.get("/my", protect, requireRole("customer"), async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ customer: req.user.id })
      .populate({
        path: "entrepreneur",
        populate: { path: "user", select: "name location" }
      })
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ENTREPRENEUR: View requests for my profile
 * GET /api/requests/entrepreneur
 */
router.get("/entrepreneur", protect, requireRole("entrepreneur") , async (req, res) => {          
  try {
    const profile = await Entrepreneur.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({ message: "Entrepreneur profile not found" });
    }

    const requests = await ServiceRequest.find({
      entrepreneur: profile._id
    }).populate("customer", "name email")
      .sort({ createdAt: -1 }); 

    res.json(requests);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * ENTREPRENEUR: Update request status (accept/reject/complete)
 * PATCH /api/requests/:id/status
 */
router.patch("/:id/status", protect, requireRole("entrepreneur"), async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["accepted", "rejected", "completed"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "status must be accepted/rejected/completed" });
    }

    const myProfile = await Entrepreneur.findOne({ user: req.user.id });
    if (!myProfile) return res.status(404).json({ message: "Entrepreneur profile not found" });

    const request = await ServiceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    // Ensure request belongs to this entrepreneur
    if (request.entrepreneur.toString() !== myProfile._id.toString()) {
      return res.status(403).json({ message: "Forbidden: not your request" });
    }

    request.status = status;
    await request.save();

    res.json({ message: `Request ${status} ✅`, request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;