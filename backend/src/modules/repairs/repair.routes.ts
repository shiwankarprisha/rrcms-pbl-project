import { Router } from "express";
import { RepairController } from "./repair.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorizeRoles } from "../../middleware/role.middleware.js";
import { validateBody } from "../../middleware/validate.middleware.js";
import { uploadImage } from "../../middleware/upload.middleware.js";
import { UserRole } from "@prisma/client";
import {
  createRepairSchema,
  verifyRepairSchema,
  createEstimateSchema,
  respondEstimateSchema,
  assignTechnicianSchema,
  updateProgressSchema,
  completeRepairSchema,
} from "./repair.schema.js";

const router = Router();

router.use(authenticate);

// Submit repair request
router.post(
  "/",
  authorizeRoles(UserRole.CUSTOMER),
  uploadImage.single("image"),
  validateBody(createRepairSchema),
  RepairController.createRepair
);

// View list of repairs (role filtered)
router.get("/", RepairController.getRepairs);

// View single repair details
router.get("/:id", RepairController.getRepairById);

// Verify repair request (Vendor / Admin)
router.patch(
  "/:id/verify",
  authorizeRoles(UserRole.ADMIN, UserRole.VENDOR),
  validateBody(verifyRepairSchema),
  RepairController.verifyRepair
);

// Create repair estimate (Vendor / Admin)
router.post(
  "/:id/estimate",
  authorizeRoles(UserRole.ADMIN, UserRole.VENDOR),
  validateBody(createEstimateSchema),
  RepairController.createEstimate
);

// Respond to estimate (Customer)
router.patch(
  "/:id/estimate",
  authorizeRoles(UserRole.CUSTOMER, UserRole.ADMIN),
  validateBody(respondEstimateSchema),
  RepairController.respondToEstimate
);

// Assign technician (Admin / Vendor)
router.post(
  "/:id/assign",
  authorizeRoles(UserRole.ADMIN, UserRole.VENDOR),
  validateBody(assignTechnicianSchema),
  RepairController.assignTechnician
);

// Update progress (Technician / Admin)
router.patch(
  "/:id/progress",
  authorizeRoles(UserRole.TECHNICIAN, UserRole.ADMIN),
  validateBody(updateProgressSchema),
  RepairController.updateProgress
);

// Complete repair (Technician / Admin)
router.patch(
  "/:id/complete",
  authorizeRoles(UserRole.TECHNICIAN, UserRole.ADMIN),
  validateBody(completeRepairSchema),
  RepairController.completeRepair
);

export default router;
