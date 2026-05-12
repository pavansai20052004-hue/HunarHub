import mongoose from "mongoose";

const serviceRequestSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    entrepreneur: { type: mongoose.Schema.Types.ObjectId, ref: "Entrepreneur", required: true },

    serviceType: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, default: "", trim: true, maxlength: 1000 },
    preferredDate: { type: String, default: "" }, // keep simple for now

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending"
    }
  },
  { timestamps: true }
);

export default mongoose.model("ServiceRequest", serviceRequestSchema);
