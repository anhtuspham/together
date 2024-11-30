import express from "express";
import {
  getFeedPosts,
  getUserPosts,
  likePost,
  updatePost,
  deletePost,
  getLikedPosts,
  getSavedPosts,
  addComment, getComments,
} from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

//---------------READ-------------------
router.get("/", verifyToken, getFeedPosts);
router.get("/:userId/posts", verifyToken, getUserPosts);
router.get("/:id", verifyToken, getSavedPosts);
router.get("/:id/comment", verifyToken, getComments);

router.get("/liked/:id", verifyToken, getLikedPosts);

//----------------UPDATE-----------------
router.patch("/:id/like", verifyToken, likePost);
router.patch("/:id", verifyToken, updatePost);
router.delete("/:id", verifyToken, deletePost);

/* CREATE */
// router.get('/:id/get/comment', verifyToken, getComments);
router.post("/:id/comment", verifyToken, addComment);

export default router;
