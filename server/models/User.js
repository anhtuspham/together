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
        friends: {
            type: Array,
            default: [],
        },
        groups: {
            type: Array,
            default: [],
        },
        location: String,
        occupation: String,
        friendShip: {
            type: mongoose.Types.ObjectId, ref: 'FriendShip'
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", UserSchema);
export default User;