import EntrepreneurModel from "./schemas/Entrepreneur.js";
import UserModel from "./schemas/User.js";
import { plain } from "./plain.js";

const userPopulate = { path: "user", select: "name email role location" };
const escapeRegex = (value) => value.replace(/[.*+?^$(){}|[\]\\]/g, "\\$&");

export default {
  async upsertForUser(userId, payload) {
    return plain(
      await EntrepreneurModel.findOneAndUpdate(
        { user: userId },
        { $set: payload, $setOnInsert: { isApproved: false } },
        { upsert: true, returnDocument: "after", runValidators: true }
      ).populate(userPopulate)
    );
  },
  async findByUserId(userId) {
    return plain(await EntrepreneurModel.findOne({ user: userId }).populate(userPopulate));
  },
  async findById(id) {
    return plain(await EntrepreneurModel.findById(id).populate(userPopulate));
  },
  async listApproved({ category, minPrice, maxPrice, location } = {}) {
    const filters = { isApproved: true };
    if (category) filters.category = category;
    if (minPrice !== undefined) filters.maxPrice = { $gte: minPrice };
    if (maxPrice !== undefined) filters.minPrice = { $lte: maxPrice };
    if (location) {
      const users = await UserModel.find({
        location: { $regex: escapeRegex(location), $options: "i" },
      }).select("_id");
      filters.user = { $in: users.map((user) => user._id) };
    }
    return plain(
      await EntrepreneurModel.find(filters)
        .populate(userPopulate)
        .sort({ updatedAt: -1 })
        .limit(100)
    );
  },
  async listPending() {
    return plain(
      await EntrepreneurModel.find({ isApproved: false })
        .populate(userPopulate)
        .sort({ createdAt: 1 })
        .limit(100)
    );
  },
  async approve(id) {
    return plain(
      await EntrepreneurModel.findByIdAndUpdate(
        id,
        { $set: { isApproved: true } },
        { returnDocument: "after", runValidators: true }
      ).populate(userPopulate)
    );
  },
};
