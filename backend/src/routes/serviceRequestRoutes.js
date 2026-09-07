import express from "express";
import { protect, requireRole } from "../middleware/auth.js";
import Entrepreneur from "../models/Entrepreneur.js";
import ServiceRequest from "../models/ServiceRequest.js";
import { asyncHandler, HttpError } from "../utils/httpError.js";

const router = express.Router();
const objectIdPattern = /^[0-9a-f]{24}$/i;

const ensureObjectId = (value, label) => {
  if (!objectIdPattern.test(value)) {
    throw new HttpError(400, `Invalid ${label}`);
  }
};

router.post(
  "/",
  protect,
  requireRole("customer"),
  asyncHandler(async (req, res) => {
    if (!req.body || typeof req.body.serviceType !== "string" ||
        (req.body.description !== undefined && typeof req.body.description !== "string") ||
        (req.body.preferredDate !== undefined && typeof req.body.preferredDate !== "string")) {
      throw new HttpError(400, "Service type, description, and preferred date must be text");
    }
    const entrepreneurId = req.body.entrepreneurId;
    const serviceType = req.body.serviceType?.trim();
    const description = req.body.description?.trim() || "";
    const preferredDate = req.body.preferredDate || "";

    if (!entrepreneurId || !serviceType) {
      throw new HttpError(400, "Entrepreneur and service type are required");
    }

    ensureObjectId(entrepreneurId, "entrepreneur id");
    if (serviceType.length > 100 || description.length > 1000) {
      throw new HttpError(400, "Service type must be at most 100 characters and description at most 1000");
    }

    if (preferredDate && Number.isNaN(Date.parse(preferredDate))) {
      throw new HttpError(400, "Preferred date is invalid");
    }

    const entrepreneur = await Entrepreneur.findById(entrepreneurId);
    if (!entrepreneur || !entrepreneur.isApproved) {
      throw new HttpError(404, "Entrepreneur not found or not approved");
    }

    const request = await ServiceRequest.create({
      customer: req.user.id,
      entrepreneur: entrepreneurId,
      serviceType,
      description,
      preferredDate,
    });

    return res.status(201).json(request);
  })
);

router.get(
  "/my",
  protect,
  requireRole("customer"),
  asyncHandler(async (req, res) => {
    const requests = await ServiceRequest.listByCustomer(req.user.id);

    return res.json(requests);
  })
);

router.get(
  "/entrepreneur",
  protect,
  requireRole("entrepreneur"),
  asyncHandler(async (req, res) => {
    const profile = await Entrepreneur.findByUserId(req.user.id);

    if (!profile) {
      throw new HttpError(404, "Entrepreneur profile not found");
    }

    const requests = await ServiceRequest.listByEntrepreneur(profile._id);

    return res.json(requests);
  })
);

router.patch(
  "/:id/status",
  protect,
  requireRole("entrepreneur"),
  asyncHandler(async (req, res) => {
    const { status } = req.body || {};
    const allowedTransitions = {
      pending: ["accepted", "rejected"],
      accepted: ["completed"],
    };

    ensureObjectId(req.params.id, "request id");

    if (!["accepted", "rejected", "completed"].includes(status)) {
      throw new HttpError(400, "Status must be accepted, rejected, or completed");
    }

    const myProfile = await Entrepreneur.findByUserId(req.user.id);
    if (!myProfile) {
      throw new HttpError(404, "Entrepreneur profile not found");
    }

    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      throw new HttpError(404, "Request not found");
    }

    if (request.entrepreneur?._id !== myProfile._id) {
      throw new HttpError(403, "Forbidden: not your request");
    }

    if (!allowedTransitions[request.status]?.includes(status)) {
      throw new HttpError(400, `Cannot change request from ${request.status} to ${status}`);
    }

    const updated = await ServiceRequest.updateStatus(req.params.id, status, request.status);
    if (!updated) throw new HttpError(409, "Request changed. Refresh and try again.");

    return res.json({ message: `Request ${status}`, request: updated });
  })
);

router.patch(
  "/:id/cancel",
  protect,
  requireRole("customer"),
  asyncHandler(async (req, res) => {
    ensureObjectId(req.params.id, "request id");

    const request = await ServiceRequest.findById(req.params.id);
    if (!request) {
      throw new HttpError(404, "Request not found");
    }

    if (request.customer?._id !== req.user.id) {
      throw new HttpError(403, "Forbidden: not your request");
    }

    if (request.status !== "pending") {
      throw new HttpError(400, "Only pending requests can be cancelled");
    }

    const updated = await ServiceRequest.updateStatus(req.params.id, "cancelled", "pending");
    if (!updated) throw new HttpError(409, "Request changed. Refresh and try again.");

    return res.json({ message: "Request cancelled", request: updated });
  })
);

export default router;
