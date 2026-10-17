import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error("Unhandled Error:", err);

  if (err.code === "P2002") {
    const target = err.meta?.target ? ` (${err.meta.target})` : "";
    res.status(409).json({
      success: false,
      error: `Conflict: A record with this unique field already exists${target}.`,
    });
    return;
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    error: message,
  });
};
