import ServiceRequestModel from "./schemas/ServiceRequest.js";
import { plain } from "./plain.js";

const populate = [
  { path: "customer", select: "name email" },
  { path: "entrepreneur", populate: { path: "user", select: "name location" } },
];

export default {
  async create(payload) {
    const request = await ServiceRequestModel.create(payload);
    return this.findById(request._id);
  },
  async findById(id) {
    return plain(await ServiceRequestModel.findById(id).populate(populate));
  },
  async listByCustomer(customer) {
    return plain(
      await ServiceRequestModel.find({ customer })
        .populate(populate)
        .sort({ createdAt: -1 })
    );
  },
  async listByEntrepreneur(entrepreneur) {
    return plain(
      await ServiceRequestModel.find({ entrepreneur })
        .populate(populate)
        .sort({ createdAt: -1 })
    );
  },
  async updateStatus(id, status, expectedStatus) {
    return plain(
      await ServiceRequestModel.findOneAndUpdate(
        { _id: id, status: expectedStatus },
        { $set: { status } },
        { returnDocument: "after", runValidators: true }
      ).populate(populate)
    );
  },
};
