import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Unauthenticated request.",
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Access denied. Permitted roles: ${allowedRoles.join(", ")}`,
      });
      return;
    }

    next();
  };
};
