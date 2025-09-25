import "dotenv/config";
import { prisma } from "../prisma/prismaClient.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

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
    const hashed = bcrypt.hash(password, 10);
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
    const user = await prisma.user.findUnique({
      where: {
        OR: [{ email: identifier.toLowerCase() }, { username: identifier }],
      },
      omit: {
        password: false,
      },
    });

    if (!user) throw new Error("Invalid credentials");

    const isValid = bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Invalid credentials");

    const accessToken = jwt.sign({ userId: user.id }, ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign({ userId: user.id }, REFRESH_TOKEN_SECRET, {
      expiresIn: "7d",
    });

    await prisma.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { user, accessToken, refreshToken };
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

    const accessToken = jwt.sign(
      { userId: token.userId },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    return accessToken;
  },
  logout: async (refreshToken: string) => {
    await prisma.refreshToken.update({
      where: { token: refreshToken },
      data: { revoked: true },
    });
  },
};
