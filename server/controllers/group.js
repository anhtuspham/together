import express from "express";
import Group from "../models/Group.js";
import User from "../models/User.js";

const router = express.Router();

export const getGroup = async (req, res) => {
    try {
        const groups = await Group.find();
        res.status(200).json(groups);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Failed to fetch groups"});
    }
}

export const addGroup = async (req, res) => {
    const {userId} = req.params;
    const {name, description, isPublic} = req.body;

    try {
        const newGroup = new Group({
            name,
            description,
            // picturePath,
            isPublic,
            admin: userId,
            members: [userId],
        });

        await newGroup.save();
        res.status(201).json({message: "Group created successfully", group: newGroup});
    } catch (err) {
        res.status(500).json({message: "Error creating group", error: err.message});
    }
};

export const joinGroup = async (req, res) => {
    const {groupId, userId} = req.params;

    try {
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({message: "Group not found"});
        }

        if (group.isPublic) {
            if (!group.members.includes(userId)) {
                group.members.push(userId);
                await group.save();
            }
            return res.status(200).json({message: "Joined group successfully", group});
        } else {
            if (!group.requests) group.requests = [];
            if (!group.requests.includes(userId)) {
                group.requests.push(userId);
                await group.save();
            }
            return res.status(200).json({message: "Request to join group sent", group});
        }
    } catch (err) {
        res.status(500).json({message: "Error joining group", error: err.message});
    }
};

export const leaveGroup = async (req, res) => {
    const {groupId} = req.params;
    const userId = req.user.id;

    try {
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({message: "Group not found"});
        }

        if (!group.members.includes(userId)) {
            return res.status(400).json({message: "You are not a member of this group"});
        }

        group.members = group.members.filter((id) => id.toString() !== userId.toString());
        if (group.admin.toString() === userId.toString()) {
            return res.status(403).json({message: "Admin cannot leave the group"});
        }

        await group.save();
        res.status(200).json({message: "Left group successfully", group});
    } catch (err) {
        res.status(500).json({message: "Error leaving group", error: err.message});
    }
};

export const acceptJoinGroup = async (req, res) => {
    const {groupId, userId, adminId} = req.params;

    try {
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({message: "Group not found"});
        }

        if (group.admin.toString() !== adminId.toString()) {
            return res.status(403).json({message: "Only the admin can approve requests"});
        }

        if (!group.requests || !group.requests.includes(userId)) {
            return res.status(400).json({message: "Request not found"});
        }

        group.members.push(userId);
        group.requests = group.requests.filter((id) => id.toString() !== userId.toString());

        await group.save();
        res.status(200).json({message: "User approved to join group", group});
    } catch (err) {
        res.status(500).json({message: "Error approving user", error: err.message});
    }
};

export const rejectJoinGroup = async (req, res) => {
    const {groupId, userId, adminId} = req.params;

    try {
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({message: "Group not found"});
        }

        if (group.admin.toString() !== adminId.toString()) {
            return res.status(403).json({message: "Only the admin can decline requests"});
        }

        if (!group.requests || !group.requests.includes(userId)) {
            return res.status(400).json({message: "Request not found"});
        }

        group.requests = group.requests.filter((id) => id.toString() !== userId.toString());
        await group.save();

        res.status(200).json({message: "User declined to join group", group});
    } catch (err) {
        res.status(500).json({message: "Error declining user", error: err.message});
    }
};

export const searchUser = async (req, res) => {
    const { username, groupname } = req.query;
    try {
        let users = [];
        let groups = [];

        if (username) {
            users = await User.find({
                $or: [
                    { firstName: { $regex: username, $options: "i" } },
                    { lastName: { $regex: username, $options: "i" } },
                ],
            }).select("_id firstName lastName occupation picturePath");
        }

        if (groupname) {
            groups = await Group.find({
                name: { $regex: groupname, $options: "i" },
            }).select("_id name description picturePath");
        }

        res.status(200).json({ users, groups });
    } catch (error) {
        console.error("Error during search:", error);
        res.status(500).json({ message: "Search failed" });
    }
}

export const getGroupStatus = async (req, res) => {
    const { groupId, userId } = req.params;

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        const isMember = group.members.includes(userId);
        const isAdmin = group.admin.toString() === userId;

        res.status(200).json({ isMember, isAdmin });
    } catch (error) {
        console.error("Error checking group status:", error);
        res.status(500).json({ message: "Failed to check group status" });
    }
}

export const getRequest = async (req, res) => {
    const { groupId, userId } = req.params;

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (group.admin.toString() !== userId) {
            return res.status(403).json({ message: "You are not authorized to view requests" });
        }

        const requests = await User.find({ '_id': { $in: group.requests } });
        res.status(200).json({ requests });
    } catch (error) {
        console.error("Error fetching requests:", error);
        res.status(500).json({ message: "Failed to fetch requests" });
    }
}

export const getGroupsUserHasJoined = async (req, res) => {
    const { userId } = req.params;

    try {
        const groups = await Group.find({
            members: userId,
        }).populate('members', 'firstName lastName');

        res.status(200).json(groups);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch groups" });
    }
}

export const getGroupsUserIsAdmin = async (req, res) => {
    const { userId } = req.params;

    try {
        const groups = await Group.find({ admin: userId }).populate('admin', 'firstName lastName');

        res.status(200).json(groups);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch groups" });
    }
};

export const getGroupsUserHasRequestedToJoin = async (req, res) => {
    const { userId } = req.params;

    try {

        const groups = await Group.find({
            requests: userId,
            isPublic: false,
        }).populate('requests', 'firstName lastName');

        res.status(200).json(groups);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch groups" });
    }
};



export default router;
