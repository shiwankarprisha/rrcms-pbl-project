import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import { validateBody } from "../../middleware/validate.middleware.js";
import { authenticate } from "../../middleware/auth.middleware.js";
import { registerSchema, loginSchema } from "./auth.schema.js";

const router = Router();

router.post("/register", validateBody(registerSchema), AuthController.register);
router.post("/login", validateBody(loginSchema), AuthController.login);
router.get("/me", authenticate, AuthController.getMe);
router.post("/logout", authenticate, AuthController.logout);

export default router;
