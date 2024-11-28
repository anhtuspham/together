import mongoose from "mongoose";

const friendship = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {type: String, enum: ["none", "pending", "friend"]},
    },
    {timestamps: true}
);

const Friendship = mongoose.model("Friendship", friendship);

export default Friendship;
