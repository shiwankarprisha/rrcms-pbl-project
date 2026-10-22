import { Request, Response, NextFunction } from "express";
import { NotificationService } from "./notification.service.js";

export class NotificationController {
  static async getNotifications(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const notifications = await NotificationService.getUserNotifications(
        req.user.id,
      );
      res.status(200).json({ success: true, data: notifications });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const id = parseInt(req.params.id as string, 10);
      await NotificationService.markAsRead(id, req.user.id);
      res.status(200).json({ success: true, message: "Marked as read" });
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      await NotificationService.markAllAsRead(req.user.id);
      res.status(200).json({ success: true, message: "All marked as read" });
    } catch (error) {
      next(error);
    }
  }

  static async clearAll(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }

      await NotificationService.clearAll(req.user.id);
      res.status(200).json({ success: true, message: "Notifications cleared" });
    } catch (error) {
      next(error);
    }
  }
}
