import express from "express";
import Group from "../models/group.js";

const router = express.Router();

export const addGroup = async (req, res) => {
    const { name, description, picturePath, isPublic } = req.body;
    const userId = req.user.id; // Lấy userId từ session hoặc JWT

    try {
        const newGroup = new Group({
            name,
            description,
            picturePath,
            isPublic,
            admin: userId,
            members: [userId], // Người tạo nhóm là admin và cũng là thành viên
        });

        await newGroup.save();
        res.status(201).json({ message: "Group created successfully", group: newGroup });
    } catch (err) {
        res.status(500).json({ message: "Error creating group", error: err.message });
    }
};

// Tham gia nhóm
export const joinGroup = async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id; // Lấy userId từ session hoặc JWT

    try {
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (group.isPublic) {
            // Thêm trực tiếp nếu là nhóm công khai
            if (!group.members.includes(userId)) {
                group.members.push(userId);
                await group.save();
            }
            return res.status(200).json({ message: "Joined group successfully", group });
        } else {
            // Lưu yêu cầu nếu là nhóm riêng tư
            if (!group.requests) group.requests = [];
            if (!group.requests.includes(userId)) {
                group.requests.push(userId);
                await group.save();
            }
            return res.status(200).json({ message: "Request to join group sent", group });
        }
    } catch (err) {
        res.status(500).json({ message: "Error joining group", error: err.message });
    }
};

// Rời nhóm
export const leaveGroup = async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user.id; // Lấy userId từ session hoặc JWT

    try {
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (!group.members.includes(userId)) {
            return res.status(400).json({ message: "You are not a member of this group" });
        }

        group.members = group.members.filter((id) => id.toString() !== userId.toString());
        if (group.admin.toString() === userId.toString()) {
            return res.status(403).json({ message: "Admin cannot leave the group" });
        }

        await group.save();
        res.status(200).json({ message: "Left group successfully", group });
    } catch (err) {
        res.status(500).json({ message: "Error leaving group", error: err.message });
    }
};

// Phê duyệt yêu cầu
export const acceptJoinGroup = async (req, res) => {
    const { groupId, userId } = req.params;
    const adminId = req.user.id; // Admin thực hiện thao tác

    try {
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (group.admin.toString() !== adminId.toString()) {
            return res.status(403).json({ message: "Only the admin can approve requests" });
        }

        if (!group.requests || !group.requests.includes(userId)) {
            return res.status(400).json({ message: "Request not found" });
        }

        group.members.push(userId);
        group.requests = group.requests.filter((id) => id.toString() !== userId.toString());

        await group.save();
        res.status(200).json({ message: "User approved to join group", group });
    } catch (err) {
        res.status(500).json({ message: "Error approving user", error: err.message });
    }
};

// Từ chối yêu cầu
export const rejectJoinGroup = async (req, res) => {
    const { groupId, userId } = req.params;
    const adminId = req.user.id;

    try {
        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (group.admin.toString() !== adminId.toString()) {
            return res.status(403).json({ message: "Only the admin can decline requests" });
        }

        if (!group.requests || !group.requests.includes(userId)) {
            return res.status(400).json({ message: "Request not found" });
        }

        group.requests = group.requests.filter((id) => id.toString() !== userId.toString());
        await group.save();

        res.status(200).json({ message: "User declined to join group", group });
    } catch (err) {
        res.status(500).json({ message: "Error declining user", error: err.message });
    }
};




export default router;
