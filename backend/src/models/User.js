import UserModel from "./schemas/User.js";
import { plain } from "./plain.js";

export default {
  async existsByEmail(email) {
    return Boolean(await UserModel.exists({ email }));
  },
  async create(payload) {
    return plain(await UserModel.create(payload));
  },
  async findByEmail(email) {
    return plain(await UserModel.findOne({ email }));
  },
};
