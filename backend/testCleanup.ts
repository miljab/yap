import { beforeEach } from "vitest";
import { prisma } from "./prisma/prismaClient.js";

beforeEach(async () => {
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({});
});
