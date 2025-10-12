import "dotenv/config";
import { prisma } from "../prisma/prismaClient.js";
import bcrypt from "bcrypt";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";

export const authService = {
  signup: async ({
    email,
    username,
    password,
  }: {
    email: string;
    username: string;
    password: string;
  }) => {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username,
        password: hashed,
      },
    });

    return user;
  },

  login: async ({
    identifier,
    password,
  }: {
    identifier: string;
    password: string;
  }) => {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier.toLowerCase() }, { username: identifier }],
      },
      omit: {
        password: false,
      },
    });

    if (!user || !user.password) throw new Error("Invalid credentials");

    const isValid = bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Invalid credentials");

    const accessToken = generateAccessToken(user.id);

    const refreshToken = generateRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, accessToken, refreshToken };
  },

  refresh: async (refreshToken: string) => {
    const token = await prisma.refreshToken.findUnique({
      where: {
        token: refreshToken,
        expiresAt: { gt: new Date() },
        revoked: false,
      },
    });

    if (!token) throw new Error("Invalid refresh token");

    const accessToken = generateAccessToken(token.userId);
    return accessToken;
  },

  logout: async (refreshToken: string) => {
    await prisma.refreshToken.update({
      where: { token: refreshToken },
      data: { revoked: true },
    });
  },
};
