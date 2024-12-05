import express from "express";
import {forgotPassword, login, resetPassword, verifyEmail} from "../controllers/auth.js";


const router = express.Router();

//This would be /auth/login
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword)
router.post("/reset-password", resetPassword);
export default router;

