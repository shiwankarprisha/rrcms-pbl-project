import {
  RepairStatus,
  EstimateStatus,
  AssignmentStatus,
  UserRole,
  DeliveryType,
  DeliveryStatus,
} from "@prisma/client";
import { prisma } from "../../prisma.js";
import { AuthUser } from "../../types/auth.js";
import { NotificationService } from "../notifications/notification.service.js";
import { NagpurRoutingService } from "../routing/nagpur-routing.service.js";
import {
  CreateRepairInput,
  VerifyRepairInput,
  CreateEstimateInput,
  RespondEstimateInput,
  AssignTechnicianInput,
  UpdateProgressInput,
  CompleteRepairInput,
} from "./repair.schema.js";

export class RepairService {
  /**
   * Generates a collision-resistant human-readable tracking number
   * Format: RRCMS-YYYYMMDD-XXXX
   */
  static async generateRequestNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");

    for (let attempts = 0; attempts < 10; attempts++) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const candidate = `RRCMS-${dateStr}-${randomSuffix}`;
      const exists = await prisma.repairRequest.findUnique({
        where: { requestNumber: candidate },
      });
      if (!exists) {
        return candidate;
      }
    }
    return `RRCMS-${dateStr}-${Date.now().toString().slice(-4)}`;
  }

  /**
   * Submit new repair request (Customer)
   * Automatically assigns closest authorized Vendor and Delivery Partner in Nagpur based on shortest distance
   */
  static async createRepair(customerId: number, input: CreateRepairInput, imageUrl?: string) {
    const requestNumber = await this.generateRequestNumber();

    // Calculate shortest distance Nagpur vendor and delivery partner
    const routingAddress = input.pickupAddress || "Sitabuldi, Nagpur";
    const routing = await NagpurRoutingService.findShortestDistancePartners(routingAddress);

    return prisma.$transaction(async (tx) => {
      const repair = await tx.repairRequest.create({
        data: {
          requestNumber,
          customerId,
          vendorId: routing.vendor.id, // Auto-assigned closest authorized vendor!
          deviceType: input.deviceType,
          deviceBrand: input.deviceBrand || null,
          deviceModel: input.deviceModel || null,
          serialNumber: input.serialNumber || null,
          issueDescription: input.issueDescription,
          imageUrl: imageUrl || null,
          status: RepairStatus.SUBMITTED,
          pickupRequested: Boolean(input.pickupRequested),
          pickupAddress: input.pickupAddress || null,
        },
      });

      await tx.repairStatusHistory.create({
        data: {
          repairId: repair.id,
          oldStatus: null,
          newStatus: RepairStatus.SUBMITTED,
          changedById: customerId,
          note: input.pickupRequested
            ? `Repair request submitted. Doorstep pickup requested from ${routing.localityName}. Assigned to closest vendor: ${routing.vendor.hubName} (${routing.vendorDistanceKm} km).`
            : `Repair request submitted. Routed to nearest service centre: ${routing.vendor.hubName} (${routing.vendorDistanceKm} km).`,
        },
      });

      // Automatically schedule and ASSIGN initial pickup dispatch if requested
      if (input.pickupRequested && input.pickupAddress) {
        const scheduledDate = new Date();
        scheduledDate.setDate(scheduledDate.getDate() + 1); // scheduled for tomorrow

        const pickup = await tx.pickupDelivery.create({
          data: {
            repairId: repair.id,
            type: DeliveryType.PICKUP,
            status: DeliveryStatus.ASSIGNED, // Immediately assigned to courier!
            assignedPartnerId: routing.deliveryPartner.id, // Closest logistics partner!
            scheduledAt: scheduledDate,
            address: input.pickupAddress,
            customerNotes: `Doorstep collection assigned to nearest courier partner: ${routing.deliveryPartner.name} (${routing.deliveryPartner.hubName}, ${routing.partnerDistanceKm} km away).`,
          },
        });

        await tx.deliveryStatusHistory.create({
          data: {
            deliveryId: pickup.id,
            oldStatus: null,
            newStatus: DeliveryStatus.ASSIGNED,
            changedById: customerId,
            note: `Initial doorstep pickup automatically dispatched to closest courier: ${routing.deliveryPartner.name} (${routing.deliveryPartner.hubName}, ${routing.partnerDistanceKm} km away).`,
          },
        });

        // Notify assigned delivery partner
        await NotificationService.createNotification(
          routing.deliveryPartner.id,
          "New Doorstep Pickup Assigned",
          `Doorstep pickup for repair #${requestNumber} (${input.deviceType}) in ${routing.localityName} (${routing.partnerDistanceKm} km from your base) has been assigned to you. Scheduled for tomorrow.`,
          "INFO",
          `/delivery/dashboard`
        );
      }

      // Notify assigned vendor
      await NotificationService.createNotification(
        routing.vendor.id,
        "New Repair Request Assigned",
        `New repair request #${requestNumber} (${input.deviceType}) from ${routing.localityName} (${routing.vendorDistanceKm} km from your workshop) has been assigned to your service centre.`,
        "INFO",
        `/vendor/dashboard`
      );

      // Notify customer
      await NotificationService.createNotification(
        customerId,
        "Repair Request Dispatched",
        input.pickupRequested
          ? `Your repair request #${requestNumber} has been received and routed to ${routing.vendor.name} (${routing.vendor.hubName}). Courier partner ${routing.deliveryPartner.name} (${routing.deliveryPartner.hubName}, ${routing.partnerDistanceKm} km away) has been assigned for doorstep pickup tomorrow.`
          : `Your repair request #${requestNumber} has been received and routed to your nearest service centre: ${routing.vendor.name} (${routing.vendor.hubName}, ${routing.vendorDistanceKm} km away). You can drop off your device for inspection.`,
        "SUCCESS",
        `/repairs/${repair.id}`
      );

      return repair;
    });
  }

  /**
   * Get repairs filtered by role
   */
  static async getRepairs(user: AuthUser, queryStatus?: RepairStatus) {
    const where: any = {};

    if (queryStatus) {
      where.status = queryStatus;
    }

    if (user.role === UserRole.CUSTOMER) {
      where.customerId = user.id;
    } else if (user.role === UserRole.TECHNICIAN) {
      where.assignments = {
        some: {
          technicianId: user.id,
        },
      };
    } else if (user.role === UserRole.VENDOR) {
      where.OR = [
        { vendorId: user.id },
        { vendorId: null, status: RepairStatus.SUBMITTED },
      ];
    }
    // ADMIN sees all

    return prisma.repairRequest.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        vendor: {
          select: { id: true, name: true, email: true, phone: true },
        },
        assignments: {
          include: {
            technician: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { assignedAt: "desc" },
        },
        deliveries: {
          include: {
            assignedPartner: {
              select: { id: true, name: true, email: true, phone: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get a single repair by ID with role-based ownership validation
   */
  static async getRepairById(repairId: number, user: AuthUser) {
    const repair = await prisma.repairRequest.findUnique({
      where: { id: repairId },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        vendor: {
          select: { id: true, name: true, email: true, phone: true },
        },
        assignments: {
          include: {
            technician: {
              select: { id: true, name: true, email: true, phone: true },
            },
          },
          orderBy: { assignedAt: "desc" },
        },
        deliveries: {
          include: {
            assignedPartner: {
              select: { id: true, name: true, email: true, phone: true },
            },
            history: {
              orderBy: { changedAt: "desc" },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        statusHistory: {
          orderBy: { changedAt: "desc" },
        },
      },
    });

    if (!repair) {
      const error: any = new Error("Repair request not found");
      error.status = 404;
      throw error;
    }

    // Role-based visibility check
    if (user.role === UserRole.CUSTOMER && repair.customerId !== user.id) {
      const error: any = new Error("Access denied: You do not own this repair request");
      error.status = 403;
      throw error;
    }

    if (user.role === UserRole.TECHNICIAN) {
      const isAssigned = repair.assignments.some((a) => a.technicianId === user.id);
      if (!isAssigned) {
        const error: any = new Error("Access denied: You are not assigned to this repair");
        error.status = 403;
        throw error;
      }
    }

    return repair;
  }

  /**
   * Verify repair request (Vendor / Admin)
   */
  static async verifyRepair(repairId: number, user: AuthUser, input: VerifyRepairInput) {
    const repair = await prisma.repairRequest.findUnique({ where: { id: repairId } });

    if (!repair) {
      const error: any = new Error("Repair request not found");
      error.status = 404;
      throw error;
    }

    if (repair.status !== RepairStatus.SUBMITTED) {
      const error: any = new Error(`Cannot verify request in '${repair.status}' status`);
      error.status = 400;
      throw error;
    }

    const newStatus = input.decision === "ACCEPT" ? RepairStatus.UNDER_INSPECTION : RepairStatus.REJECTED;
    const vendorId = input.vendorId || (user.role === UserRole.VENDOR ? user.id : repair.vendorId);

    return prisma.$transaction(async (tx) => {
      const updated = await tx.repairRequest.update({
        where: { id: repairId },
        data: {
          status: newStatus,
          vendorId: vendorId || null,
        },
      });

      await tx.repairStatusHistory.create({
        data: {
          repairId,
          oldStatus: repair.status,
          newStatus,
          changedById: user.id,
          note: input.notes || `Request ${input.decision.toLowerCase()}ed by ${user.role}.`,
        },
      });

      // Notify customer
      await NotificationService.createNotification(
        repair.customerId,
        `Repair Request ${input.decision === "ACCEPT" ? "Accepted" : "Rejected"}`,
        `Your repair request #${repair.requestNumber} has been ${input.decision.toLowerCase()}ed by our service centre. Note: ${
          input.notes || "Device queued for diagnostic assessment."
        }`,
        input.decision === "ACCEPT" ? "INFO" : "WARNING",
        `/repairs/${repairId}`
      );

      return updated;
    });
  }

  /**
   * Generate repair estimate (Vendor / Admin)
   */
  static async createEstimate(repairId: number, user: AuthUser, input: CreateEstimateInput) {
    const repair = await prisma.repairRequest.findUnique({ where: { id: repairId } });

    if (!repair) {
      const error: any = new Error("Repair request not found");
      error.status = 404;
      throw error;
    }

    if (repair.status !== RepairStatus.UNDER_INSPECTION && repair.status !== RepairStatus.SUBMITTED) {
      const error: any = new Error(`Cannot generate estimate when status is '${repair.status}'`);
      error.status = 400;
      throw error;
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.repairRequest.update({
        where: { id: repairId },
        data: {
          estimatedCost: input.estimatedCost,
          estimatedDays: input.estimatedDays,
          estimateNotes: input.estimateNotes || null,
          estimateStatus: EstimateStatus.PENDING,
          status: RepairStatus.AWAITING_APPROVAL,
        },
      });

      await tx.repairStatusHistory.create({
        data: {
          repairId,
          oldStatus: repair.status,
          newStatus: RepairStatus.AWAITING_APPROVAL,
          changedById: user.id,
          note: `Estimate generated: ₹${input.estimatedCost} (${input.estimatedDays} days). Awaiting customer approval.`,
        },
      });

      // Notify customer of estimate
      await NotificationService.createNotification(
        repair.customerId,
        "Repair Estimate Ready for Review",
        `An estimate of ₹${input.estimatedCost} (est. ${input.estimatedDays} days) is ready for #${repair.requestNumber}. Please review and approve on your dashboard.`,
        "INFO",
        `/customer/dashboard`
      );

      return updated;
    });
  }

  /**
   * Customer approves or rejects repair estimate
   */
  static async respondToEstimate(repairId: number, user: AuthUser, input: RespondEstimateInput) {
    const repair = await prisma.repairRequest.findUnique({ where: { id: repairId } });

    if (!repair) {
      const error: any = new Error("Repair request not found");
      error.status = 404;
      throw error;
    }

    if (repair.customerId !== user.id && user.role !== UserRole.ADMIN) {
      const error: any = new Error("Only the customer who submitted the request can respond to the estimate");
      error.status = 403;
      throw error;
    }

    if (repair.status !== RepairStatus.AWAITING_APPROVAL) {
      const error: any = new Error(`Cannot respond to estimate when status is '${repair.status}'`);
      error.status = 400;
      throw error;
    }

    const isApproval = input.action === "APPROVE";
    const newStatus = isApproval ? RepairStatus.APPROVED : RepairStatus.CANCELLED;
    const estimateStatus = isApproval ? EstimateStatus.APPROVED : EstimateStatus.REJECTED;

    return prisma.$transaction(async (tx) => {
      const updated = await tx.repairRequest.update({
        where: { id: repairId },
        data: {
          status: newStatus,
          estimateStatus,
        },
      });

      await tx.repairStatusHistory.create({
        data: {
          repairId,
          oldStatus: repair.status,
          newStatus,
          changedById: user.id,
          note: isApproval
            ? "Estimate approved by customer. Ready for technician assignment."
            : `Estimate rejected by customer. ${input.notes || ""}`.trim(),
        },
      });

      // Notify vendor if assigned
      if (repair.vendorId) {
        await NotificationService.createNotification(
          repair.vendorId,
          `Estimate ${input.action}D by Customer`,
          `Customer ${input.action.toLowerCase()}ed estimate for repair #${repair.requestNumber}.${
            isApproval ? " You may now assign a technician." : ""
          }`,
          isApproval ? "SUCCESS" : "WARNING",
          `/repairs/${repairId}`
        );
      }

      return updated;
    });
  }

  /**
   * Assign technician to approved repair (Vendor / Admin)
   */
  static async assignTechnician(repairId: number, user: AuthUser, input: AssignTechnicianInput) {
    const repair = await prisma.repairRequest.findUnique({ where: { id: repairId } });

    if (!repair) {
      const error: any = new Error("Repair request not found");
      error.status = 404;
      throw error;
    }

    if (repair.status !== RepairStatus.APPROVED && repair.status !== RepairStatus.IN_REPAIR) {
      const error: any = new Error("Technician can only be assigned to approved repairs");
      error.status = 400;
      throw error;
    }

    const tech = await prisma.user.findFirst({
      where: { id: input.technicianId, role: UserRole.TECHNICIAN, isActive: true },
    });

    if (!tech) {
      const error: any = new Error("Specified technician was not found or is inactive");
      error.status = 404;
      throw error;
    }

    return prisma.$transaction(async (tx) => {
      const assignment = await tx.technicianAssignment.create({
        data: {
          repairId,
          technicianId: tech.id,
          status: AssignmentStatus.ASSIGNED,
          notes: input.notes || null,
        },
      });

      const updated = await tx.repairRequest.update({
        where: { id: repairId },
        data: {
          status: RepairStatus.IN_REPAIR,
        },
      });

      await tx.repairStatusHistory.create({
        data: {
          repairId,
          oldStatus: repair.status,
          newStatus: RepairStatus.IN_REPAIR,
          changedById: user.id,
          note: `Assigned to technician ${tech.name}. Repair in progress.`,
        },
      });

      // Notify technician
      await NotificationService.createNotification(
        tech.id,
        "New Workbench Assignment",
        `You have been assigned to repair #${repair.requestNumber} (${repair.deviceBrand || ""} ${
          repair.deviceModel || repair.deviceType
        }). Notes: ${input.notes || "Inspect device"}`,
        "INFO",
        `/technician/dashboard`
      );

      return { repair: updated, assignment };
    });
  }

  /**
   * Technician updates diagnosis and repair progress
   */
  static async updateProgress(repairId: number, user: AuthUser, input: UpdateProgressInput) {
    const repair = await prisma.repairRequest.findUnique({
      where: { id: repairId },
      include: { assignments: true },
    });

    if (!repair) {
      const error: any = new Error("Repair request not found");
      error.status = 404;
      throw error;
    }

    if (user.role === UserRole.TECHNICIAN) {
      const isAssigned = repair.assignments.some((a) => a.technicianId === user.id);
      if (!isAssigned) {
        const error: any = new Error("You are not assigned to this repair");
        error.status = 403;
        throw error;
      }
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.repairRequest.update({
        where: { id: repairId },
        data: {
          diagnosisNotes: input.diagnosisNotes !== undefined ? input.diagnosisNotes : repair.diagnosisNotes,
          repairNotes: input.repairNotes !== undefined ? input.repairNotes : repair.repairNotes,
        },
      });

      if (input.diagnosisNotes || input.repairNotes) {
        await tx.repairStatusHistory.create({
          data: {
            repairId,
            oldStatus: repair.status,
            newStatus: repair.status,
            changedById: user.id,
            note: `Progress update recorded by ${user.name}.`,
          },
        });
      }

      return updated;
    });
  }

  /**
   * Mark repair complete (Technician / Admin)
   */
  static async completeRepair(repairId: number, user: AuthUser, input: CompleteRepairInput) {
    const repair = await prisma.repairRequest.findUnique({
      where: { id: repairId },
      include: { assignments: true },
    });

    if (!repair) {
      const error: any = new Error("Repair request not found");
      error.status = 404;
      throw error;
    }

    if (repair.status !== RepairStatus.IN_REPAIR) {
      const error: any = new Error(`Cannot complete repair in '${repair.status}' status`);
      error.status = 400;
      throw error;
    }

    if (user.role === UserRole.TECHNICIAN) {
      const isAssigned = repair.assignments.some((a) => a.technicianId === user.id);
      if (!isAssigned) {
        const error: any = new Error("You are not assigned to this repair");
        error.status = 403;
        throw error;
      }
    }

    const now = new Date();

    return prisma.$transaction(async (tx) => {
      const updated = await tx.repairRequest.update({
        where: { id: repairId },
        data: {
          status: RepairStatus.REPAIR_COMPLETED,
          finalCost: input.finalCost !== undefined ? input.finalCost : repair.estimatedCost,
          repairCompletedAt: now,
        },
      });

      // Update technician assignment to completed
      await tx.technicianAssignment.updateMany({
        where: { repairId, status: { in: [AssignmentStatus.ASSIGNED, AssignmentStatus.IN_PROGRESS] } },
        data: { status: AssignmentStatus.COMPLETED, completedAt: now },
      });

      await tx.repairStatusHistory.create({
        data: {
          repairId,
          oldStatus: repair.status,
          newStatus: RepairStatus.REPAIR_COMPLETED,
          changedById: user.id,
          note: input.notes || "Repair successfully completed. Eligible for delivery handover.",
        },
      });

      // Notify customer
      await NotificationService.createNotification(
        repair.customerId,
        "Repair Successfully Completed",
        `Your repair for #${repair.requestNumber} is finished! Final cost: ₹${
          input.finalCost || repair.estimatedCost || 0
        }. It is now eligible for doorstep delivery.`,
        "SUCCESS",
        `/repairs/${repairId}`
      );

      return updated;
    });
  }
}
