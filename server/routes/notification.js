import express from "express";
import {getNotification, markAsReadNotification} from "../controllers/notification.js";


const router = express.Router();

router.get("/:userId", getNotification);
router.post("/:notifId/read", markAsReadNotification);
export default router;

