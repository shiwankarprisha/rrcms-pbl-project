import { Router } from "express";
import { NotificationController } from "./notification.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", NotificationController.getNotifications);
router.delete("/clear-all", NotificationController.clearAll);
router.patch("/:id/read", NotificationController.markAsRead);
router.patch("/read-all", NotificationController.markAllAsRead);

export default router;
