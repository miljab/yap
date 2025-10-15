import "dotenv/config";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "./verifyAccessToken.js";
import { prisma } from "../prisma/prismaClient.js";

export async function verifyOnboardingToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token: string | undefined = req.cookies.onboardingToken;

  if (!token)
    return res.status(401).json({ error: "Onboarding token is required" });

  jwt.verify(
    token,
    process.env.ONBOARDING_TOKEN_SECRET!,
    async (err, payload) => {
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
          return res
            .status(401)
            .json({ error: "Unauthorized: User not found" });

        req.user = user;
        next();
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  );
}
