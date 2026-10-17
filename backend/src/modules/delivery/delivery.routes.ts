import { Router } from "express";
import { DeliveryController } from "./delivery.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorizeRoles } from "../../middleware/role.middleware.js";
import { validateBody } from "../../middleware/validate.middleware.js";
import { UserRole } from "@prisma/client";
import {
  scheduleDeliverySchema,
  assignDeliveryPartnerSchema,
  updateDeliveryStatusSchema,
  confirmReceiptSchema,
} from "./delivery.schema.js";

const router = Router();

router.use(authenticate);

// Schedule pickup or delivery (Admin, Vendor, or Customer requesting initial pickup)
router.post(
  "/schedule",
  authorizeRoles(UserRole.ADMIN, UserRole.VENDOR, UserRole.CUSTOMER),
  validateBody(scheduleDeliverySchema),
  DeliveryController.scheduleDelivery
);

// Get list of deliveries (role filtered)
router.get("/", DeliveryController.getDeliveries);

// Get single delivery assignment details
router.get("/:id", DeliveryController.getDeliveryById);

// Assign delivery partner (Admin / Vendor)
router.post(
  "/:id/assign",
  authorizeRoles(UserRole.ADMIN, UserRole.VENDOR),
  validateBody(assignDeliveryPartnerSchema),
  DeliveryController.assignPartner
);

// Update delivery status (Delivery Partner / Admin)
router.patch(
  "/:id/status",
  authorizeRoles(UserRole.DELIVERY_PARTNER, UserRole.ADMIN),
  validateBody(updateDeliveryStatusSchema),
  DeliveryController.updateStatus
);

// Confirm receipt and close repair request (Customer / Admin)
router.patch(
  "/:id/confirm-receipt",
  authorizeRoles(UserRole.CUSTOMER, UserRole.ADMIN),
  validateBody(confirmReceiptSchema),
  DeliveryController.confirmReceipt
);

export default router;
