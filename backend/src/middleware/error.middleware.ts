import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
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

  if (err instanceof Error && err.name === "MulterError") {
    const multerError = err as Error & { code: string };

    const statusCode = multerError.code === "LIMIT_FILE_SIZE" ? 413 : 400;

    const message =
      multerError.code === "LIMIT_FILE_SIZE"
        ? "Image must be 5 MB or smaller"
        : err.message;

    res.status(statusCode).json({
      success: false,
      error: message,
    });
    return;
  }

  if (
    err instanceof Error &&
    err.message === "Only JPEG, PNG, and WebP images are allowed"
  ) {
    res.status(400).json({
      success: false,
      error: err.message,
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
