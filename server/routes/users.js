import express from "express";
import {
    getUser,
    getUserFriends,
    searchUser,
    sendFriendRequest,
    getReceivedFriendRequests,
    getSentFriendRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    getFriendStatus, updateInfoUser, updatePrivacySettings
} from "../controllers/users.js";
import {verifyToken} from "../middleware/auth.js";

// Express Routers are a way to organize your Express application such that your primary app.js file does not become bloated and difficult to reason about. As you’re building an Express application or API, you’ll soon notice that the routes continue to pile up in app.js. This makes the file quite long and hard to read. As we add functionality to an application, this file would get long and cumbersome. The solution to this in Express is Routers. Routers are like mini versions of Express applications. They provide functionality for handling route matching, requests, and sending responses, but they do not start a separate server or listen on their own ports. Routers use all the .get(), .put(), .post(), and .delete() routes that you are now familiar with.
const router = express.Router();

//--------------READ---------------
router.get("/search", verifyToken, searchUser);

router.get("/:userId", verifyToken, getUser);
router.get("/:id/friends", verifyToken, getUserFriends);
router.get('/:userId/received-friend-requests', verifyToken, getReceivedFriendRequests);
router.get('/:userId/sent-friend-requests', verifyToken, getSentFriendRequests);
router.get('/:userId/:friendId/friend-status', verifyToken, getFriendStatus)

//-----------------UPDATE------------

router.patch("/:userId/:friendId", verifyToken, removeFriend);
router.post("/add-friend", verifyToken, sendFriendRequest)

router.post("/:friendId/accept-friend", verifyToken, acceptFriendRequest);
router.post("/:friendId/reject-friend", verifyToken, rejectFriendRequest);
router.post('/:userId/editInfo', verifyToken, updatePrivacySettings);

export default router;