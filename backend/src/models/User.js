import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2 },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["customer", "entrepreneur", "admin"], default: "customer" },
    location: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, createdAt: -1 });

export default mongoose.model("User", userSchema);
