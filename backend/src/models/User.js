import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["customer", "entrepreneur", "admin"], default: "customer" },
    location: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
