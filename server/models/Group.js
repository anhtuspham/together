import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
    },
    picturePath: {
        type: String,
        default: "",
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
    },
    isPublic: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, {timestamps: true,});

const Group = mongoose.model('Group', groupSchema);

export default Group;