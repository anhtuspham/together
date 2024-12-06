import User from "../models/User.js";
import Post from "../models/Post.js";
import Group from "../models/Group.js"


export const getAllUser = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
}

export const deleteUser = async (req, res) => {
    const { userId } = req.params;
    try {
        await User.findByIdAndDelete(userId);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Failed to delete user" });
    }
}

export const getAllPost = async (req, res) => {
    try {
        const posts = await Post.find()
        res.status(200).json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ message: "Failed to fetch posts" });
    }
}

export const deleteOnePost = async (req, res) => {
    const { postId } = req.params;
    try {
        await Post.findByIdAndDelete(postId);
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ message: "Failed to delete post" });
    }
}

export const getAllGroups = async (req, res) => {
    try {
        const groups = await Group.find()
            .populate('admin', 'firstName lastName')
            .populate('members', 'firstName lastName')
            .populate('post')
            .exec();
        res.status(200).json(groups);
    } catch (error) {
        console.error("Error fetching groups:", error);
        res.status(500).json({ message: "Failed to fetch groups" });
    }
};

export const deleteGroup = async (req, res) => {
    const { groupId } = req.params;
    try {
        await Group.findByIdAndDelete(groupId);
        res.status(200).json({ message: "Group deleted successfully" });
    } catch (error) {
        console.error("Error deleting group:", error);
        res.status(500).json({ message: "Failed to delete group" });
    }
}