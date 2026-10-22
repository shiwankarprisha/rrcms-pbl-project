import {
  DeliveryType,
  DeliveryStatus,
  RepairStatus,
  UserRole,
} from "@prisma/client";
import { prisma } from "../../prisma.js";
import { AuthUser } from "../../types/auth.js";
import { NotificationService } from "../notifications/notification.service.js";
import { NagpurRoutingService } from "../routing/nagpur-routing.service.js";
import {
  ScheduleDeliveryInput,
  AssignDeliveryPartnerInput,
  UpdateDeliveryStatusInput,
  ConfirmReceiptInput,
} from "./delivery.schema.js";

export class DeliveryService {
  /**
   * Schedule Pickup or Delivery
   * Enforces handover eligibility, prevents duplicate active handovers, and supports rescheduling
   */
  static async scheduleDelivery(user: AuthUser, input: ScheduleDeliveryInput) {
    const repair = await prisma.repairRequest.findUnique({
      where: { id: input.repairId },
    });

    if (!repair) {
      const error: any = new Error("Repair request not found");
      error.status = 404;
      throw error;
    }

    // Eligibility and duplicate checks for final DELIVERY
    if (input.type === DeliveryType.DELIVERY) {
      // 1. Duplicate handover prevention (only block if an ACTIVE delivery is pending)
      const existingActiveDelivery = await prisma.pickupDelivery.findFirst({
        where: {
          repairId: input.repairId,
          type: DeliveryType.DELIVERY,
          status: {
            in: [
              DeliveryStatus.SCHEDULED,
              DeliveryStatus.ASSIGNED,
              DeliveryStatus.IN_TRANSIT,
            ],
          },
        },
      });

      if (existingActiveDelivery) {
        const error: any = new Error(
          "Duplicate handover prevented: An active delivery schedule already exists for this repair",
        );
        error.status = 409;
        throw error;
      }

      // 2. Eligibility check for final DELIVERY (must be completed or ready for reschedule)
      if (
        repair.status !== RepairStatus.REPAIR_COMPLETED &&
        repair.status !== RepairStatus.READY_FOR_PICKUP
      ) {
        const error: any = new Error(
          `Cannot handover for delivery: Repair must be in 'REPAIR_COMPLETED' or 'READY_FOR_PICKUP' status (currently '${repair.status}')`,
        );
        error.status = 400;
        throw error;
      }
    }

    let assignedPartnerId = input.assignedPartnerId;
    let routingNote = "";

    // If no partner explicitly selected, automatically assign closest delivery partner based on shortest distance
    if (!assignedPartnerId) {
      try {
        const routing = await NagpurRoutingService.findShortestDistancePartners(
          input.address,
        );
        assignedPartnerId = routing.deliveryPartner.id;
        routingNote = ` Automatically routed via shortest distance to ${routing.deliveryPartner.name} (${routing.deliveryPartner.hubName}, ${routing.partnerDistanceKm} km away).`;
      } catch {
        // Fallback
      }
    } else {
      const partner = await prisma.user.findFirst({
        where: {
          id: assignedPartnerId,
          role: UserRole.DELIVERY_PARTNER,
          isActive: true,
        },
      });
      if (!partner) {
        const error: any = new Error(
          "Specified delivery partner was not found or is inactive",
        );
        error.status = 404;
        throw error;
      }
    }

    const initialStatus = assignedPartnerId
      ? DeliveryStatus.ASSIGNED
      : DeliveryStatus.SCHEDULED;

    return prisma.$transaction(async (tx) => {
      const delivery = await tx.pickupDelivery.create({
        data: {
          repairId: input.repairId,
          type: input.type,
          status: initialStatus,
          scheduledAt: new Date(input.scheduledAt),
          address: input.address,
          customerNotes: input.customerNotes || null,
          assignedPartnerId: assignedPartnerId || null,
        },
      });

      await tx.deliveryStatusHistory.create({
        data: {
          deliveryId: delivery.id,
          oldStatus: null,
          newStatus: initialStatus,
          changedById: user.id,
          note: `${input.type} scheduled for ${delivery.scheduledAt.toISOString().slice(0, 10)}.${routingNote}`,
        },
      });

      // Synchronize repair status if final delivery
      if (input.type === DeliveryType.DELIVERY) {
        await tx.repairRequest.update({
          where: { id: input.repairId },
          data: { status: RepairStatus.READY_FOR_PICKUP },
        });

        await tx.repairStatusHistory.create({
          data: {
            repairId: input.repairId,
            oldStatus: repair.status,
            newStatus: RepairStatus.READY_FOR_PICKUP,
            changedById: user.id,
            note: "Handed over to Pickup & Delivery module. Ready for courier dispatch.",
          },
        });
      }

      // Notify customer
      await NotificationService.createNotification(
        repair.customerId,
        `${input.type} Scheduled`,
        `Your device (#${repair.requestNumber}) has a ${input.type.toLowerCase()} scheduled for ${new Date(
          input.scheduledAt,
        ).toLocaleDateString()} at ${input.address}.${routingNote}`,
        "INFO",
        `/repairs/${repair.id}`,
      );

      // Notify assigned partner if assigned
      if (assignedPartnerId) {
        await NotificationService.createNotification(
          assignedPartnerId,
          `New ${input.type} Assignment`,
          `You have been assigned a ${input.type.toLowerCase()} trip for Repair #${repair.requestNumber} at ${input.address}. Scheduled for ${new Date(
            input.scheduledAt,
          ).toLocaleDateString()}.${routingNote}`,
          "INFO",
          `/delivery/dashboard`,
        );
      }

      return delivery;
    });
  }

  /**
   * Get deliveries filtered by user role
   */
  static async getDeliveries(user: AuthUser, queryStatus?: DeliveryStatus) {
    const where: any = {};

    if (queryStatus) {
      where.status = queryStatus;
    }

    if (user.role === UserRole.DELIVERY_PARTNER) {
      where.assignedPartnerId = user.id;
    } else if (user.role === UserRole.CUSTOMER) {
      where.repair = {
        customerId: user.id,
      };
    }

    return prisma.pickupDelivery.findMany({
      where,
      include: {
        repair: {
          select: {
            id: true,
            requestNumber: true,
            deviceType: true,
            deviceBrand: true,
            deviceModel: true,
            status: true,
            customer: {
              select: { id: true, name: true, email: true, phone: true },
            },
            vendor: {
              select: { id: true, name: true, email: true, phone: true },
            },
          },
        },
        assignedPartner: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: { scheduledAt: "desc" },
    });
  }

  /**
   * Get single delivery details with authorization check
   */
  static async getDeliveryById(id: number, user: AuthUser) {
    const delivery = await prisma.pickupDelivery.findUnique({
      where: { id },
      include: {
        repair: {
          include: {
            customer: {
              select: { id: true, name: true, phone: true, email: true },
            },
            vendor: {
              select: { id: true, name: true, phone: true, email: true },
            },
          },
        },
        assignedPartner: {
          select: { id: true, name: true, phone: true, email: true },
        },
        history: {
          orderBy: { changedAt: "desc" },
        },
      },
    });

    if (!delivery) {
      const error: any = new Error("Delivery assignment not found");
      error.status = 404;
      throw error;
    }

    if (
      user.role === UserRole.CUSTOMER &&
      delivery.repair.customerId !== user.id
    ) {
      const error: any = new Error(
        "Access denied: You do not own this delivery record",
      );
      error.status = 403;
      throw error;
    }

    if (
      user.role === UserRole.DELIVERY_PARTNER &&
      delivery.assignedPartnerId !== user.id
    ) {
      const error: any = new Error(
        "Access denied: You are not assigned to this delivery",
      );
      error.status = 403;
      throw error;
    }

    return delivery;
  }

  /**
   * Assign Delivery Partner (Admin / Vendor)
   */
  static async assignPartner(
    id: number,
    user: AuthUser,
    input: AssignDeliveryPartnerInput,
  ) {
    const delivery = await prisma.pickupDelivery.findUnique({
      where: { id },
      include: { repair: true },
    });

    if (!delivery) {
      const error: any = new Error("Delivery record not found");
      error.status = 404;
      throw error;
    }

    const partner = await prisma.user.findFirst({
      where: {
        id: input.assignedPartnerId,
        role: UserRole.DELIVERY_PARTNER,
        isActive: true,
      },
    });

    if (!partner) {
      const error: any = new Error(
        "Specified delivery partner was not found or is inactive",
      );
      error.status = 404;
      throw error;
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.pickupDelivery.update({
        where: { id },
        data: {
          assignedPartnerId: partner.id,
          status: DeliveryStatus.ASSIGNED,
        },
      });

      await tx.deliveryStatusHistory.create({
        data: {
          deliveryId: id,
          oldStatus: delivery.status,
          newStatus: DeliveryStatus.ASSIGNED,
          changedById: user.id,
          note: `Assigned to delivery partner ${partner.name}.`,
        },
      });

      // Notify delivery partner
      await NotificationService.createNotification(
        partner.id,
        "New Delivery Assignment",
        `You have been assigned a ${delivery.type.toLowerCase()} task for Repair #${delivery.repair.requestNumber} at ${delivery.address}.`,
        "INFO",
        `/delivery/dashboard`,
      );

      return updated;
    });
  }

  /**
   * Update pickup/delivery status (Delivery Partner / Admin)
   * Synchronizes cross-module repair status and handles failures cleanly
   */
  static async updateStatus(
    id: number,
    user: AuthUser,
    input: UpdateDeliveryStatusInput,
  ) {
    const delivery = await prisma.pickupDelivery.findUnique({
      where: { id },
      include: {
        repair: {
          include: { customer: true },
        },
        assignedPartner: true,
      },
    });

    if (!delivery) {
      const error: any = new Error("Delivery record not found");
      error.status = 404;
      throw error;
    }

    if (
      user.role === UserRole.DELIVERY_PARTNER &&
      delivery.assignedPartnerId !== user.id
    ) {
      const error: any = new Error(
        "Access denied: You are not assigned to this delivery",
      );
      error.status = 403;
      throw error;
    }

    const now = new Date();
    const isCompleted = input.status === DeliveryStatus.COMPLETED;

    return prisma.$transaction(async (tx) => {
      const updated = await tx.pickupDelivery.update({
        where: { id },
        data: {
          status: input.status,
          deliveryNotes: input.deliveryNotes || delivery.deliveryNotes,
          completedAt: isCompleted ? now : delivery.completedAt,
        },
      });

      await tx.deliveryStatusHistory.create({
        data: {
          deliveryId: id,
          oldStatus: delivery.status,
          newStatus: input.status,
          changedById: user.id,
          note: input.deliveryNotes || `Status updated to ${input.status}.`,
        },
      });

      // Synchronize repair status based on delivery type and state
      let synchronizedRepairStatus: RepairStatus | null = null;
      let syncNote = "";

      if (delivery.type === DeliveryType.DELIVERY) {
        if (input.status === DeliveryStatus.IN_TRANSIT) {
          synchronizedRepairStatus = RepairStatus.OUT_FOR_DELIVERY;
          syncNote = `Device is out for delivery with courier partner ${user.name}.`;

          // Notify customer of transit with time/date
          await NotificationService.createNotification(
            delivery.repair.customerId,
            "Device Out For Delivery",
            `Your device (#${delivery.repair.requestNumber}) is OUT FOR DELIVERY today (${now.toLocaleTimeString(
              [],
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            )}) by courier partner ${user.name}. Destination: ${delivery.address}.`,
            "INFO",
            `/repairs/${delivery.repair.id}`,
          );
        } else if (input.status === DeliveryStatus.COMPLETED) {
          synchronizedRepairStatus = RepairStatus.DELIVERED;
          syncNote =
            "Device delivered to customer address. Awaiting customer receipt confirmation.";

          await NotificationService.createNotification(
            delivery.repair.customerId,
            "Device Delivered",
            `Your device (#${delivery.repair.requestNumber}) has been delivered! Please inspect it and confirm receipt on your dashboard to close the request.`,
            "SUCCESS",
            `/customer/dashboard`,
          );
        } else if (input.status === DeliveryStatus.FAILED) {
          // Revert repair status so it can be rescheduled cleanly!
          synchronizedRepairStatus = RepairStatus.READY_FOR_PICKUP;
          syncNote = `Delivery attempt failed: ${input.deliveryNotes || "Customer unavailable"}. Returned to service centre, ready for courier reschedule.`;

          await NotificationService.createNotification(
            delivery.repair.customerId,
            "Delivery Attempt Failed",
            `Delivery attempt failed for #${delivery.repair.requestNumber}: ${input.deliveryNotes || "Customer unavailable at address"}. A courier re-attempt will be scheduled.`,
            "WARNING",
            `/repairs/${delivery.repair.id}`,
          );
        }
      } else if (delivery.type === DeliveryType.PICKUP) {
        if (input.status === DeliveryStatus.IN_TRANSIT) {
          syncNote = `Courier partner ${user.name} is en route to collect the device from customer address.`;

          await NotificationService.createNotification(
            delivery.repair.customerId,
            "Courier En Route for Doorstep Pickup",
            `Courier partner ${user.name} is on the way to collect your device at ${delivery.address}.`,
            "INFO",
            `/repairs/${delivery.repair.id}`,
          );
        } else if (input.status === DeliveryStatus.COMPLETED) {
          synchronizedRepairStatus = RepairStatus.UNDER_INSPECTION;
          syncNote = `Customer device picked up from address and safely delivered to workshop by ${user.name}. Ready for inspection.`;

          await NotificationService.createNotification(
            delivery.repair.customerId,
            "Device Picked Up Successfully",
            `Your device (#${delivery.repair.requestNumber}) has been collected by ${user.name} and delivered to the service centre for inspection.`,
            "SUCCESS",
            `/repairs/${delivery.repair.id}`,
          );

          if (delivery.repair.vendorId) {
            await NotificationService.createNotification(
              delivery.repair.vendorId,
              "Device Delivered for Inspection",
              `Device for repair #${delivery.repair.requestNumber} has arrived at your workshop from doorstep pickup. Ready for inspection.`,
              "INFO",
              `/vendor/dashboard`,
            );
          }
        } else if (input.status === DeliveryStatus.FAILED) {
          synchronizedRepairStatus = RepairStatus.SUBMITTED;
          syncNote = `Pickup attempt failed: ${input.deliveryNotes || "Address unreachable"}. Ready for courier reschedule.`;

          await NotificationService.createNotification(
            delivery.repair.customerId,
            "Pickup Attempt Failed",
            `Pickup attempt failed for #${delivery.repair.requestNumber}: ${input.deliveryNotes || "Address unreachable"}. Please verify your address or coordinate with our team.`,
            "WARNING",
            `/repairs/${delivery.repair.id}`,
          );
        }
      }

      if (
        synchronizedRepairStatus &&
        synchronizedRepairStatus !== delivery.repair.status
      ) {
        await tx.repairRequest.update({
          where: { id: delivery.repairId },
          data: { status: synchronizedRepairStatus },
        });

        await tx.repairStatusHistory.create({
          data: {
            repairId: delivery.repairId,
            oldStatus: delivery.repair.status,
            newStatus: synchronizedRepairStatus,
            changedById: user.id,
            note: syncNote,
          },
        });
      }

      return updated;
    });
  }

  /**
   * Customer confirms receipt -> Closes repair request (SCRUM-28 & SCRUM-30)
   */
  static async confirmReceipt(
    deliveryId: number,
    user: AuthUser,
    input: ConfirmReceiptInput,
  ) {
    const delivery = await prisma.pickupDelivery.findUnique({
      where: { id: deliveryId },
      include: { repair: true },
    });

    if (!delivery) {
      const error: any = new Error("Delivery record not found");
      error.status = 404;
      throw error;
    }

    if (
      delivery.repair.customerId !== user.id &&
      user.role !== UserRole.ADMIN
    ) {
      const error: any = new Error(
        "Only the customer who owns this repair can confirm receipt",
      );
      error.status = 403;
      throw error;
    }

    // Must be in delivered or completed state
    if (delivery.status !== DeliveryStatus.COMPLETED) {
      const error: any = new Error(
        `Cannot confirm receipt when delivery status is '${delivery.status}'. Device must be delivered first.`,
      );
      error.status = 400;
      throw error;
    }

    if (delivery.customerConfirmed) {
      const error: any = new Error(
        "Receipt has already been confirmed for this delivery",
      );
      error.status = 400;
      throw error;
    }

    const now = new Date();

    return prisma.$transaction(async (tx) => {
      // 1. Mark delivery confirmed and completed
      const updatedDelivery = await tx.pickupDelivery.update({
        where: { id: deliveryId },
        data: {
          customerConfirmed: true,
          confirmedAt: now,
          status: DeliveryStatus.COMPLETED,
          completedAt: delivery.completedAt || now,
        },
      });

      await tx.deliveryStatusHistory.create({
        data: {
          deliveryId,
          oldStatus: delivery.status,
          newStatus: DeliveryStatus.COMPLETED,
          changedById: user.id,
          note: `Customer receipt confirmed. ${input.notes || ""}`.trim(),
        },
      });

      // 2. Final repair request status synchronization: CLOSE request
      const updatedRepair = await tx.repairRequest.update({
        where: { id: delivery.repairId },
        data: {
          status: RepairStatus.CLOSED,
          closedAt: now,
        },
      });

      await tx.repairStatusHistory.create({
        data: {
          repairId: delivery.repairId,
          oldStatus: delivery.repair.status,
          newStatus: RepairStatus.CLOSED,
          changedById: user.id,
          note: "Repair request successfully closed following customer delivery confirmation.",
        },
      });

      // Notify customer
      await NotificationService.createNotification(
        delivery.repair.customerId,
        "Repair Closed & Completed",
        `Thank you for using RRCMS! Repair #${delivery.repair.requestNumber} has been officially closed.`,
        "SUCCESS",
        `/repairs/${delivery.repair.id}`,
      );

      return { delivery: updatedDelivery, repair: updatedRepair };
    });
  }
}
