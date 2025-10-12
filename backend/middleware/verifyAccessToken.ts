import "dotenv/config";
import jwt from "jsonwebtoken";
import { type Request, type Response, type NextFunction } from "express";
import { prisma } from "../prisma/prismaClient.js";

export interface JwtPayload {
  userId: string;
}

export const verifyAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, async (err, payload) => {
    if (err) return res.status(403).json({ error: "Forbidden" });

    if (!payload || typeof payload !== "object" || !("userId" in payload))
      return res.status(403).json({ error: "Forbidden: Invalid token" });

    try {
      const user = await prisma.user.findUnique({
        where: {
          id: (payload as JwtPayload).userId,
        },
      });

      if (!user)
        return res.status(401).json({ error: "Unauthorized: User not found" });

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
};
