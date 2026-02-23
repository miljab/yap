import "dotenv/config";
import { prisma } from "../prisma/prismaClient.js";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import type { User } from "@prisma/client";

export async function verifyRefreshToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken)
      return res.status(401).json({ error: "No refresh token" });

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!,
    ) as { userId: string };

    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        userId: decoded.userId,
        revoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!storedToken) {
      res.clearCookie("refreshToken");
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    req.user = <User>storedToken.user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.clearCookie("refreshToken");
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    next(error);
  }
}
