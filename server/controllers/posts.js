import Post from "../models/Post.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";


//-------------CREATE------------
export const createPost = async (req, res) => {
    try {
        const {userId, description, picturePath} = req.body;
        const user = await User.findById(userId);

        const newPost = new Post({
            userId,
            firstName: user.firstName,
            lastName: user.lastName,
            location: user.location,
            description,
            //This is the User profile Image
            userPicturePath: user.picturePath,
            //This is the image they want to post
            picturePath,
            likes: {},
            comments: []
        });

        await newPost.save();

        //Now we grab all posts along with new post
        const post = await Post.find();
        res.status(201).json(post);

    } catch (err) {
        res.status(409).json({message: err.message});
    }
}

//------------------READ------------------
export const getFeedPosts = async (req, res) => {
    try {
        const post = await Post.find();
        res.status(200).json(post);

    } catch (err) {
        res.status(404).json({message: err.message});
    }
}

export const getUserPosts = async (req, res) => {
    try {

        const {userId} = req.params;
        const post = await Post.find({userId});
        res.status(200).json(post);

    } catch (err) {
        res.status(404).json({message: err.message});
    }
}

export const getSavedPosts = async (req, res) => {
    try {
        const {id} = req.params;
        console.log(id);
        const posts = await Post.find({_id: {$in: id}});
        res.status(200).json(posts);
    } catch (err) {
        res.status(404).json({message: err.message});
    }
};

export const getLikedPosts = async (req, res) => {
    try {
        const {userId} = req.params;
        const posts = await Post.find({'likes.userId': userId});
        res.status(200).json(posts);
    } catch (err) {
        res.status(404).json({message: err.message});
    }
};

//-------------UPDATE------------------
export const likePost = async (req, res) => {
    try {
        const {id} = req.params;
        const {userId} = req.body;
        //Grab Post Info
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({message: 'Post not found'});
        }
        //Checking if User has liked the Post or not
        const isLiked = post.likes.get(userId);


        //If its liked, then unlike it or else, like it
        if (isLiked) {
            post.likes.delete(userId);
        } else {
            post.likes.set(userId, true);
        }

        //Update the post by finding it again and passing new likes
        const updatedPost = await Post.findByIdAndUpdate(
            id,
            {likes: post.likes},
            {new: true}
        );

        //Update the frontend
        res.status(200).json(updatedPost);

    } catch (err) {
        res.status(404).json({message: err.message});
    }

};

export const updatePost = async (req, res) => {
    try {
        const {id} = req.params;
        const updatedData = req.body;

        // Tìm và cập nhật bài post
        const updatedPost = await Post.findByIdAndUpdate(
            id,
            {$set: updatedData},
            {new: true}
        );

        if (!updatedPost) {
            return res.status(404).json({message: "Post not found"});
        }

        res.status(200).json(updatedPost);
    } catch (error) {
        res.status(500).json({message: "Failed to update post", error: error.message});
    }
};

export const deletePost = async (req, res) => {
    try {
        const {id} = req.params;

        const deletedPost = await Post.findByIdAndDelete(id);

        if (!deletedPost) {
            return res.status(404).json({message: "Post not found"});
        }

        res.status(200).json({message: "Post deleted successfully"});
    } catch (error) {
        res.status(500).json({message: "Failed to delete post", error: error.message});
    }
};

/* CREATE COMMENT */

export const addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId, content } = req.body;

        console.log('userId, content, postId', userId, content, postId)

        const newComment = await Comment.create({ userId, postId, content });

        // Populate user data
        const populatedComment = await newComment.populate('userId', 'firstName lastName picturePath');

        // Thêm comment ID vào Post
        await Post.findByIdAndUpdate(postId, { $push: { comments: newComment._id } });

        res.status(201).json({ newComment: populatedComment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


export const getComments = async (req, res) => {
    try {
        const {postId} = req.params;

        const post = await Post.findById(postId).populate({
            path: "comments",
            populate: {path: "userId", select: "firstName lastName picturePath"},
        });

        if (!post) {
            return res.status(404).json({error: "Post not found"});
        }
        return res.status(200).json({comments: post.comments});
    } catch (err) {
        console.error(err);
        return res.status(500).json({error: "Server error"});
    }
};
