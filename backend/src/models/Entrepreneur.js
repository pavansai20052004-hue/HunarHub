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
    },
    experienceYears: {
      type: Number,
      default: 0,
    },
    minPrice: {
      type: Number,
      default: 0,
    },
    maxPrice: {
      type: Number,
      default: 0,
    },
    isApproved: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

export default mongoose.model("Entrepreneur", entrepreneurSchema);