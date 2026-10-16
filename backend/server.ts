import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import { prisma } from "./prisma.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(helmet());
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Basic API health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    application: "RRCMS API",
    message: "Backend is running successfully",
  });
});

// Real MySQL connectivity check through Prisma
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

app.listen(PORT, () => {
  console.log(`RRCMS API running at http://localhost:${PORT}`);
});