export const JWT_SECRET = process.env.JWT_SECRET || "rrcms-dev-super-secret-jwt-key-change-in-production-2026";
export const JWT_EXPIRES_IN = "7d";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
