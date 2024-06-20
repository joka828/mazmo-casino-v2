import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { CASINO_ADMIN_IDS } from "./constants";

export interface AuthRequest extends Request {
  claims: Record<string, unknown>;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const jwtClaims = await jwt.verify(
      token.replace("Bearer ", ""),
      process.env.MAZMO_CHANNEL_JWT_SECRET
    );

    req.claims = jwtClaims;
    next();
  } catch (e) {
    console.error(e);
    return res.status(401).send("Unauthorized");
  }
};

export const adminAuthMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  return await authMiddleware(req, res, () => {
    if (
      !(
        CASINO_ADMIN_IDS.includes(req.claims.userId as number) ||
        req.claims.role === "OWNER"
      )
    ) {
      return res.status(401).send("Unauthorized");
    }
    next();
  });
};
