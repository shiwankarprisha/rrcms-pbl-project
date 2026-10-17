import { Router } from "express";
import { UserController } from "./user.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { authorizeRoles } from "../../middleware/role.middleware.js";
import { UserRole } from "@prisma/client";

const router = Router();

router.use(authenticate);

router.get(
  "/technicians",
  authorizeRoles(UserRole.ADMIN, UserRole.VENDOR),
  UserController.getTechnicians
);

router.get(
  "/delivery-partners",
  authorizeRoles(UserRole.ADMIN, UserRole.VENDOR),
  UserController.getDeliveryPartners
);

router.get(
  "/vendors",
  authorizeRoles(UserRole.ADMIN),
  UserController.getVendors
);

router.patch("/profile", UserController.updateProfile);

export default router;
