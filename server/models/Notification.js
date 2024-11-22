import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    message: {
        type: String,
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    postId: {
        type: mongoose.Types.ObjectId,
        ref: 'Post',
    },
    chatId: {
        type: mongoose.Types.ObjectId,
        ref: 'Chat',
    },
    type: {
        type: String,
        enum: ['like', 'comment', 'save', 'follow', 'message'],
    },
    link: {
        type: String,
    },
    seenBy: [{
        type: mongoose.Types.ObjectId,
        ref: 'User',
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
})

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;