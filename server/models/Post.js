import mongoose from "mongoose";

const postSchema = mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        location: String,
        description: String,
        picturePath: String,
        userPicturePath: String,
        isPersonalPost: {
            type: Boolean,
            default: true,
        },
        group: {
            type: mongoose.Types.ObjectId,
            ref: 'Group',
        },

        likes: {
            type: Map,
            of: Boolean,
        },
        comments: [
            {type: mongoose.Types.ObjectId, ref: 'Comment'}],
        isReported: {
            type: Boolean,
            default: false
        },
        reportReasons: [
            {
                reason: {
                    type: String,
                    enum: ["Thô tục", "Không phù hợp", "Bạo động", "Sai sự thật"],
                },
                userId: {type: String},
            },
        ],
        reportCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true
    }
);

const Post = mongoose.model("Post", postSchema);

export default Post;

