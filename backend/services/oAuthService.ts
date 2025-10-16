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

  onboard: async (userId: string, username: string, email: string) => {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    const userUpdate = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        username: username,
        email: user?.email || email,
      },
      include: {
        account: true,
      },
    });

    if (!userUpdate.account[0]) throw new Error("Account not found");

    await prisma.account.update({
      where: {
        id: userUpdate.account[0].id,
      },
      data: {
        isPending: false,
      },
    });

    const accessToken = generateAccessToken(userUpdate.id);
    const refreshToken = generateRefreshToken(userUpdate.id);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: userUpdate.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { updatedUser: userUpdate, accessToken, refreshToken };
  },
};
