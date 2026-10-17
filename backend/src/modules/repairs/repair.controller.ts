import { Request, Response, NextFunction } from "express";
import { RepairService } from "./repair.service.js";
import { RepairStatus } from "@prisma/client";

export class RepairController {
  static async createRepair(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
      const repair = await RepairService.createRepair(req.user.id, req.body, imageUrl);
      res.status(201).json({
        success: true,
        message: "Repair request submitted successfully",
        data: repair,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRepairs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const status = req.query.status as RepairStatus | undefined;
      const repairs = await RepairService.getRepairs(req.user, status);
      res.status(200).json({ success: true, data: repairs });
    } catch (error) {
      next(error);
    }
  }

  static async getRepairById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, error: "Invalid repair ID" });
        return;
      }
      const repair = await RepairService.getRepairById(id, req.user);
      res.status(200).json({ success: true, data: repair });
    } catch (error) {
      next(error);
    }
  }

  static async verifyRepair(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const id = parseInt(req.params.id as string, 10);
      const repair = await RepairService.verifyRepair(id, req.user, req.body);
      res.status(200).json({
        success: true,
        message: `Repair request ${req.body.decision.toLowerCase()}ed`,
        data: repair,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createEstimate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const id = parseInt(req.params.id as string, 10);
      const repair = await RepairService.createEstimate(id, req.user, req.body);
      res.status(200).json({
        success: true,
        message: "Estimate created and awaiting customer approval",
        data: repair,
      });
    } catch (error) {
      next(error);
    }
  }

  static async respondToEstimate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const id = parseInt(req.params.id as string, 10);
      const repair = await RepairService.respondToEstimate(id, req.user, req.body);
      res.status(200).json({
        success: true,
        message: `Estimate ${req.body.action.toLowerCase()}ed`,
        data: repair,
      });
    } catch (error) {
      next(error);
    }
  }

  static async assignTechnician(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const id = parseInt(req.params.id as string, 10);
      const result = await RepairService.assignTechnician(id, req.user, req.body);
      res.status(200).json({
        success: true,
        message: "Technician assigned successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const id = parseInt(req.params.id as string, 10);
      const repair = await RepairService.updateProgress(id, req.user, req.body);
      res.status(200).json({
        success: true,
        message: "Diagnosis and repair notes updated",
        data: repair,
      });
    } catch (error) {
      next(error);
    }
  }

  static async completeRepair(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }
      const id = parseInt(req.params.id as string, 10);
      const repair = await RepairService.completeRepair(id, req.user, req.body);
      res.status(200).json({
        success: true,
        message: "Repair marked complete and ready for pickup/delivery handover",
        data: repair,
      });
    } catch (error) {
      next(error);
    }
  }
}
