import express from "express";
import mongoose from "mongoose";
import Entrepreneur from "../models/Entrepreneur.js";
import ServiceRequest from "../models/ServiceRequest.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, requireRole("customer"), async (req, res) => {
  try {
    const entrepreneurId = req.body.entrepreneurId;
    const serviceType = req.body.serviceType?.trim();
    const description = req.body.description?.trim() || "";
    const preferredDate = req.body.preferredDate || "";

    if (!entrepreneurId || !serviceType) {
      return res.status(400).json({ message: "entrepreneurId and serviceType are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(entrepreneurId)) {
      return res.status(400).json({ message: "Invalid entrepreneur id" });
    }

    const entrepreneur = await Entrepreneur.findById(entrepreneurId);
    if (!entrepreneur || !entrepreneur.isApproved) {
      return res.status(404).json({ message: "Entrepreneur not found or not approved" });
    }

    const request = await ServiceRequest.create({
      customer: req.user.id,
      entrepreneur: entrepreneurId,
      serviceType,
      description,
      preferredDate,
    });

    return res.status(201).json(request);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/my", protect, requireRole("customer"), async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ customer: req.user.id })
      .populate({
        path: "entrepreneur",
        populate: { path: "user", select: "name location" },
      })
      .sort({ createdAt: -1 });

    return res.json(requests);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.get("/entrepreneur", protect, requireRole("entrepreneur"), async (req, res) => {
  try {
    const profile = await Entrepreneur.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({ message: "Entrepreneur profile not found" });
    }

    const requests = await ServiceRequest.find({ entrepreneur: profile._id })
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    return res.json(requests);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

router.patch("/:id/status", protect, requireRole("entrepreneur"), async (req, res) => {
  try {
    const { status } = req.body;
    const allowedTransitions = {
      pending: ["accepted", "rejected"],
      accepted: ["completed"],
    };

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid request id" });
    }

    if (!["accepted", "rejected", "completed"].includes(status)) {
      return res.status(400).json({ message: "status must be accepted, rejected, or completed" });
    }

    const myProfile = await Entrepreneur.findOne({ user: req.user.id });
    if (!myProfile) {
      return res.status(404).json({ message: "Entrepreneur profile not found" });
    }

    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.entrepreneur.toString() !== myProfile._id.toString()) {
      return res.status(403).json({ message: "Forbidden: not your request" });
    }

    if (!allowedTransitions[request.status]?.includes(status)) {
      return res.status(400).json({ message: `Cannot change request from ${request.status} to ${status}` });
    }

    request.status = status;
    await request.save();

    return res.json({ message: `Request ${status}`, request });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
