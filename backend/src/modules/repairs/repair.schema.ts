import { z } from "zod";

export const createRepairSchema = z.object({
  deviceType: z
    .string()
    .trim()
    .min(1, "Device type is required")
    .max(100, "Device type must not exceed 100 characters"),
  deviceBrand: z
    .string()
    .max(100)
    .optional()
    .nullable()
    .transform((val) =>
      val && val.trim().length > 0 ? val.trim() : undefined,
    ),
  deviceModel: z
    .string()
    .max(100)
    .optional()
    .nullable()
    .transform((val) =>
      val && val.trim().length > 0 ? val.trim() : undefined,
    ),
  serialNumber: z
    .string()
    .max(100)
    .optional()
    .nullable()
    .transform((val) =>
      val && val.trim().length > 0 ? val.trim() : undefined,
    ),
  issueDescription: z
    .string()
    .min(5, "Issue description must be at least 5 characters"),
  pickupRequested: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => {
      if (typeof val === "string")
        return val.toLowerCase() === "true" || val === "1";
      return Boolean(val);
    }),
  pickupAddress: z
    .string()
    .optional()
    .nullable()
    .transform((val) =>
      val && val.trim().length > 0 ? val.trim() : undefined,
    ),
});

export const verifyRepairSchema = z.object({
  decision: z.enum(["ACCEPT", "REJECT"]),
  notes: z.string().optional(),
  vendorId: z.number().int().positive().optional(),
});

export const createEstimateSchema = z.object({
  estimatedCost: z.number().nonnegative("Estimated cost must be >= 0"),
  estimatedDays: z.number().int().positive("Estimated days must be at least 1"),
  estimateNotes: z.string().optional(),
});

export const respondEstimateSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  notes: z.string().optional(),
});

export const assignTechnicianSchema = z.object({
  technicianId: z.number().int().positive("A valid technician ID is required"),
  notes: z.string().optional(),
});

export const updateProgressSchema = z.object({
  diagnosisNotes: z.string().optional(),
  repairNotes: z.string().optional(),
});

export const completeRepairSchema = z.object({
  finalCost: z.number().nonnegative().optional(),
  notes: z.string().optional(),
});

export type CreateRepairInput = z.infer<typeof createRepairSchema>;
export type VerifyRepairInput = z.infer<typeof verifyRepairSchema>;
export type CreateEstimateInput = z.infer<typeof createEstimateSchema>;
export type RespondEstimateInput = z.infer<typeof respondEstimateSchema>;
export type AssignTechnicianInput = z.infer<typeof assignTechnicianSchema>;
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;
export type CompleteRepairInput = z.infer<typeof completeRepairSchema>;
