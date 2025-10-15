import { prisma } from "../prisma/prismaClient.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateTokens.js";

export const oAuthService = {
  isPending: async (userId: string) => {
    const account = await prisma.account.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!account) throw new Error("Account not found");

    return account.isPending;
  },

  createRefreshToken: async (userId: string) => {
    const refreshToken = generateRefreshToken(userId);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return refreshToken;
  },

  onboard: async (userId: string, username: string) => {
    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        username: username,
      },
      include: {
        account: true,
      },
    });

    if (!user.account[0]) throw new Error("Account not found");

    await prisma.account.update({
      where: {
        id: user.account[0].id,
      },
      data: {
        isPending: false,
      },
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  },
};
