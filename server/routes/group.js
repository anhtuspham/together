import express from "express";
import {
    acceptJoinGroup,
    addGroup, deleteGroup, getAllGroups,
    getGroup,
    getGroupStatus, getRequest,
    joinGroup,
    leaveGroup,
    rejectJoinGroup
} from "../controllers/group.js";
import {verifyToken} from "../middleware/auth.js";
import {searchUser} from "../controllers/group.js";
import {deleteUser} from "../controllers/users.js";

const router = express.Router();
router.get("/search", verifyToken, searchUser);
router.get("/:groupId/:userId/status", verifyToken, getGroupStatus);
router.get("/:groupId/:userId/get-request", verifyToken, getRequest);

router.get("/get-group", getGroup);
router.post("/:userId/add-group", addGroup);
router.post("/:groupId/:userId/join", joinGroup);
router.post("/:groupId/leave", leaveGroup);
router.post("/:groupId/requests/:userId/:adminId/accept", acceptJoinGroup);
router.post("/:groupId/requests/:userId/:adminId/reject", rejectJoinGroup);

// admin
router.get("/admin/all-group", verifyToken, getAllGroups);
router.delete('/admin/delete/:groupId', verifyToken, deleteGroup);


export default router;

