import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";
import { prisma } from "../../prisma.js";

export class UserController {
  static async getTechnicians(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const technicians = await prisma.user.findMany({
        where: { role: UserRole.TECHNICIAN, isActive: true },
        select: { id: true, name: true, email: true, phone: true },
        orderBy: { name: "asc" },
      });
      res.status(200).json({ success: true, data: technicians });
    } catch (error) {
      next(error);
    }
  }

  static async getDeliveryPartners(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const partners = await prisma.user.findMany({
        where: { role: UserRole.DELIVERY_PARTNER, isActive: true },
        select: { id: true, name: true, email: true, phone: true },
        orderBy: { name: "asc" },
      });
      res.status(200).json({ success: true, data: partners });
    } catch (error) {
      next(error);
    }
  }

  static async getVendors(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendors = await prisma.user.findMany({
        where: { role: UserRole.VENDOR, isActive: true },
        select: { id: true, name: true, email: true, phone: true },
        orderBy: { name: "asc" },
      });
      res.status(200).json({ success: true, data: vendors });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const { name, phone } = req.body;
      const updated = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          name: name || undefined,
          phone: phone !== undefined ? phone : undefined,
        },
        select: { id: true, name: true, email: true, role: true, phone: true },
      });
      res.status(200).json({ success: true, data: updated, message: "Profile updated successfully" });
    } catch (error) {
      next(error);
    }
  }
}
