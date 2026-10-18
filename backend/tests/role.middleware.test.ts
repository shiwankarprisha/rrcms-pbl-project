import { describe, it, expect, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";
import { authorizeRoles } from "../src/middleware/role.middleware.js";

function createMocks(user?: { id: number; role: UserRole }) {
  const req = { user } as unknown as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next = vi.fn() as unknown as NextFunction;

  return { req, res, next };
}

describe("authorizeRoles middleware", () => {
  it("returns 401 when the request is unauthenticated", () => {
    const { req, res, next } = createMocks();

    authorizeRoles(UserRole.ADMIN)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Unauthenticated request.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 403 when the user's role is not permitted", () => {
    const { req, res, next } = createMocks({
      id: 1,
      role: UserRole.CUSTOMER,
    });

    authorizeRoles(UserRole.ADMIN)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Access denied. Permitted roles: ADMIN",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next when the user's role is permitted", () => {
    const { req, res, next } = createMocks({
      id: 1,
      role: UserRole.ADMIN,
    });

    authorizeRoles(UserRole.ADMIN)(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
