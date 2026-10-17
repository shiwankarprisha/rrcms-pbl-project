import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import { prisma } from "./prisma.js";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import repairRoutes from "./modules/repairs/repair.routes.js";
import deliveryRoutes from "./modules/delivery/delivery.routes.js";
import notificationRoutes from "./modules/notifications/notification.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
const uploadDir = path.resolve(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadDir));

// Health Check Endpoints
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    application: "RRCMS API",
    message: "Backend is running successfully",
  });
});

app.get("/api/health/db", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      application: "RRCMS API",
      database: "connected",
    });
  } catch (error) {
    console.error("Database health check failed:", error);
    res.status(503).json({
      status: "error",
      application: "RRCMS API",
      database: "disconnected",
    });
  }
});

// Mount Resource Modules
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/repairs", repairRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/notifications", notificationRoutes);

// Centralized error handler
app.use(errorHandler);

export default app;
