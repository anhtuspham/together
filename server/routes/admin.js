import express from "express";
import {
    changeRole,
    deleteGroup,
    deleteOnePost,
    deleteUser,
    getAllGroups,
    getAllPost,
    getAllUser
} from "../controllers/admin.js";
import {verifyToken} from "../middleware/auth.js";


const router = express.Router();

// GET
router.get("/all-user", verifyToken,getAllUser);
router.get("/all-post", verifyToken, getAllPost);
router.get("/all-group", verifyToken, getAllGroups);

// POST
router.patch("/update-role/:userId", verifyToken, changeRole);

// DELETE
router.delete('/admin/delete/:userId', verifyToken, deleteUser);
router.delete('/admin/delete/:postId', verifyToken, deleteOnePost);
router.delete('/admin/delete/:groupId', verifyToken, deleteGroup);


export default router;

