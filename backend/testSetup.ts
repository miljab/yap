import { execSync } from "child_process";
import { PrismaClient } from "@prisma/client";

export async function setup() {
  if (!process.env.DATABASE_URL?.includes("yap_test")) {
    throw new Error(
      "Refusing to run tests: DATABASE_URL is not a test database!"
    );
  }

  execSync("npx prisma db push --skip-generate --force-reset");
}

export async function teardown() {
  const prisma = new PrismaClient();
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.$disconnect();
}
