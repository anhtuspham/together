import express from "express";
import {
    getUser,
    getUserFriends,
    // searchUser,
    sendFriendRequest,
    getReceivedFriendRequests,
    getSentFriendRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    getFriendStatus, updatePrivacySettings, getUserActivity
} from "../controllers/users.js";
import {verifyToken} from "../middleware/auth.js";

const router = express.Router();

//--------------READ---------------
// router.get("/search", verifyToken, searchUser);

router.get("/:userId", verifyToken, getUser);
router.get("/:id/friends", verifyToken, getUserFriends);
router.get('/:userId/received-friend-requests', verifyToken, getReceivedFriendRequests);
router.get('/:userId/sent-friend-requests', verifyToken, getSentFriendRequests);
router.get('/:userId/:friendId/friend-status', verifyToken, getFriendStatus)
// router.get('/all-activities/:userId', verifyToken, getUserActivity);
router.get('/get/all-activities', verifyToken, getUserActivity);

//-----------------UPDATE------------

router.patch("/:userId/:friendId", verifyToken, removeFriend);
router.post("/add-friend", verifyToken, sendFriendRequest)

router.post("/:friendId/accept-friend", verifyToken, acceptFriendRequest);
router.post("/:friendId/reject-friend", verifyToken, rejectFriendRequest);
router.post('/:userId/editInfo', verifyToken, updatePrivacySettings);

export default router;