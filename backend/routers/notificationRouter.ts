import express from "express";
import { verifyAccessToken } from "../middleware/verifyAccessToken.js";
import {
  streamNotifications,
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from "../controllers/notificationController.js";

const createNotificationRouter = () => {
  const router = express.Router();

  router.get("/notifications/stream", verifyAccessToken, streamNotifications);

  router.get("/notifications", verifyAccessToken, getNotifications);

  router.put("/notifications/:id/read", verifyAccessToken, markAsRead);

  router.put("/notifications/read-all", verifyAccessToken, markAllAsRead);

  router.get("/notifications/unread-count", verifyAccessToken, getUnreadCount);

  return router;
};

export default createNotificationRouter;
