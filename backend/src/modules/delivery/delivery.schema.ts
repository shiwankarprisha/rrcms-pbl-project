import { z } from "zod";
import { DeliveryType, DeliveryStatus } from "@prisma/client";

export const scheduleDeliverySchema = z.object({
  repairId: z.number().int().positive("A valid repair ID is required"),
  type: z.enum([DeliveryType.PICKUP, DeliveryType.DELIVERY]),
  scheduledAt: z
    .string()
    .datetime("Scheduled date must be a valid ISO datetime"),
  address: z.string().min(5, "Delivery address must be at least 5 characters"),
  customerNotes: z.string().optional(),
  assignedPartnerId: z.number().int().positive().optional(),
});

export const assignDeliveryPartnerSchema = z.object({
  assignedPartnerId: z
    .number()
    .int()
    .positive("A valid delivery partner ID is required"),
});

export const updateDeliveryStatusSchema = z
  .object({
    status: z.enum([
      DeliveryStatus.ASSIGNED,
      DeliveryStatus.IN_TRANSIT,
      DeliveryStatus.COMPLETED,
      DeliveryStatus.FAILED,
      DeliveryStatus.CANCELLED,
    ]),
    deliveryNotes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === DeliveryStatus.FAILED && !data.deliveryNotes?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deliveryNotes"],
        message: "Failure notes are required when marking a delivery as failed",
      });
    }
  });

export const confirmReceiptSchema = z.object({
  notes: z.string().optional(),
});

export type ScheduleDeliveryInput = z.infer<typeof scheduleDeliverySchema>;
export type AssignDeliveryPartnerInput = z.infer<
  typeof assignDeliveryPartnerSchema
>;
export type UpdateDeliveryStatusInput = z.infer<
  typeof updateDeliveryStatusSchema
>;
export type ConfirmReceiptInput = z.infer<typeof confirmReceiptSchema>;
