import { Request, Response, NextFunction } from "express";
import { DeliveryService } from "./delivery.service.js";
import { DeliveryStatus } from "@prisma/client";

export class DeliveryController {
  static async scheduleDelivery(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const delivery = await DeliveryService.scheduleDelivery(req.user, req.body);
      res.status(201).json({
        success: true,
        message: `${req.body.type} scheduled successfully`,
        data: delivery,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDeliveries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const status = req.query.status as DeliveryStatus | undefined;
      const deliveries = await DeliveryService.getDeliveries(req.user, status);
      res.status(200).json({ success: true, data: deliveries });
    } catch (error) {
      next(error);
    }
  }

  static async getDeliveryById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, error: "Invalid delivery ID" });
        return;
      }
      const delivery = await DeliveryService.getDeliveryById(id, req.user);
      res.status(200).json({ success: true, data: delivery });
    } catch (error) {
      next(error);
    }
  }

  static async assignPartner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const id = parseInt(req.params.id as string, 10);
      const delivery = await DeliveryService.assignPartner(id, req.user, req.body);
      res.status(200).json({
        success: true,
        message: "Delivery partner assigned successfully",
        data: delivery,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const id = parseInt(req.params.id as string, 10);
      const delivery = await DeliveryService.updateStatus(id, req.user, req.body);
      res.status(200).json({
        success: true,
        message: `Delivery status updated to ${req.body.status}`,
        data: delivery,
      });
    } catch (error) {
      next(error);
    }
  }

  static async confirmReceipt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const id = parseInt(req.params.id as string, 10);
      const result = await DeliveryService.confirmReceipt(id, req.user, req.body);
      res.status(200).json({
        success: true,
        message: "Customer receipt confirmed and repair request successfully closed",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
