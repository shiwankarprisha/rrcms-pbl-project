import { prisma } from "../../prisma.js";

export class NotificationService {
  static async createNotification(
    userId: number,
    title: string,
    message: string,
    type: "INFO" | "SUCCESS" | "WARNING" | "ALERT" = "INFO",
    linkUrl?: string
  ) {
    try {
      return await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          linkUrl: linkUrl || null,
        },
      });
    } catch (err) {
      console.error("Failed to persist notification:", err);
      return null;
    }
  }

  static async getUserNotifications(userId: number) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
  }

  static async markAsRead(id: number, userId: number) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  static async markAllAsRead(userId: number) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
