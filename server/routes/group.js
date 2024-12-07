import express from "express";
import {
    acceptJoinGroup,
    addGroup,
    getGroup,
    getGroupStatus, getGroupsUserHasJoined, getGroupsUserHasRequestedToJoin, getGroupsUserIsAdmin, getRequest,
    joinGroup,
    leaveGroup,
    rejectJoinGroup
} from "../controllers/group.js";
import {verifyToken} from "../middleware/auth.js";
import {searchUser} from "../controllers/group.js";

const router = express.Router();
router.get("/search", verifyToken, searchUser);
router.get("/:groupId/:userId/status", verifyToken, getGroupStatus);
router.get("/:groupId/:userId/get-request", verifyToken, getRequest);

router.get("/:userId/joined", verifyToken, getGroupsUserHasJoined);
router.get("/:userId/admin", verifyToken, getGroupsUserIsAdmin);
router.get("/:userId/requests", verifyToken, getGroupsUserHasRequestedToJoin);

router.get("/get-group", getGroup);
router.post("/:userId/add-group", addGroup);
router.post("/:groupId/:userId/join", joinGroup);
router.post("/:groupId/leave", leaveGroup);
router.post("/:groupId/requests/:userId/:adminId/accept", acceptJoinGroup);
router.post("/:groupId/requests/:userId/:adminId/reject", rejectJoinGroup);



export default router;

