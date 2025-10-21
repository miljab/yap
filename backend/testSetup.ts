import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";

export async function setup() {
  process.env.DATABASE_URL =
    "postgresql://miljab:zaq1%40WSX@localhost:5432/yap_test";

  execSync("npx prisma db push --skip-generate --force-reset");
}

export async function teardown() {
  const prisma = new PrismaClient();
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.$disconnect();
}
