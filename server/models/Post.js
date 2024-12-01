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
        comments:  [
            { type: mongoose.Types.ObjectId, ref: 'Comment' }]
    },
    {
        timestamps: true
    }
);

const Post = mongoose.model("Post", postSchema);

export default Post;

