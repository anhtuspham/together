import express from "express";
import { login } from "../controllers/auth.js";


const router = express.Router();

//This would be /auth/login
router.post("/login", login);
export default router;

