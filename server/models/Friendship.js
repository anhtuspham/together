import mongoose from "mongoose";

const friendship = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User" },
    requestedId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    receivedId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    status: { type: String, enum: ["pending", "accepted", "rejected"] },
  },
  { timestamps: true }
);

const Friendship = mongoose.model("Friendship", friendship);

export default Friendship;
