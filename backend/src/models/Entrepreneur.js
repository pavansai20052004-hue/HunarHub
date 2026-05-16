import mongoose from "mongoose";

const entrepreneurSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: ["cobbler", "potter", "tailor", "artisan", "vendor"],
      required: true,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    experienceYears: {
      type: Number,
      default: 0,
      min: 0,
    },
    minPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    isApproved: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

entrepreneurSchema.index({ isApproved: 1, category: 1, updatedAt: -1 });
entrepreneurSchema.index({ user: 1 }, { unique: true });

export default mongoose.model("Entrepreneur", entrepreneurSchema);
