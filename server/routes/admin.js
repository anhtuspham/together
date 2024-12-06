import express from "express";
import {deleteGroup, deleteOnePost, deleteUser, getAllGroups, getAllPost, getAllUser} from "../controllers/admin.js";
import {verifyToken} from "../middleware/auth.js";


const router = express.Router();

// GET
router.get("/all-user", getAllUser);
router.get("/all-post", getAllPost);
router.get("/all-group", verifyToken, getAllGroups);


// DELETE
router.delete('/admin/delete/:userId', verifyToken, deleteUser);
router.delete('/admin/delete/:postId', verifyToken, deleteOnePost);
router.delete('/admin/delete/:groupId', verifyToken, deleteGroup);


export default router;

