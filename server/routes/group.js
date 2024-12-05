import express from "express";
import {acceptJoinGroup, addGroup, joinGroup, leaveGroup, rejectJoinGroup} from "../controllers/group.js";

const router = express.Router();

router.get("/addGroup", addGroup);
router.post("/:groupId/join", joinGroup);
router.post("/:groupId/leave", leaveGroup);
router.post("/:groupId/requests/:userId/accept", acceptJoinGroup);
router.post("/:groupId/requests/:userId/reject", rejectJoinGroup);
export default router;

