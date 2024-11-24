import mongoose from "mongoose";

const friendship = new mongoose.Schema(
    {
        userId: {type: mongoose.Types.ObjectId, ref: "User"},
        senderId: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
        receiverId: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
        status: {type: String, enum: ["none", "pending", "friend"]},
    },
    {timestamps: true}
);

const Friendship = mongoose.model("Friendship", friendship);

export default Friendship;
