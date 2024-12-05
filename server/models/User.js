import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            min: 2,
            max: 50,
        },
        lastName: {
            type: String,
            required: true,
            min: 2,
            max: 50,
        },
        email: {
            type: String,
            required: true,
            max: 50,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            min: 5,
        },
        picturePath: {
            type: String,
            default: "",
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        status: {
            type: String,
            enum: ["active", "inactive", "banned"],
            default: "active",
        },
        friends: [],
        groups: [
            {
                groupId: {type: mongoose.Types.ObjectId, ref: "Group"},
            }
        ],
        isVerified: {
            type: Boolean,
            default: false,
        },
        location: String,
        occupation: String,
        privacySettings: {
            email: { type: Boolean, default: false }, // false is private, true is public
            location: { type: Boolean, default: false },
            occupation: { type: Boolean, default: false },
        },
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", UserSchema);
export default User;