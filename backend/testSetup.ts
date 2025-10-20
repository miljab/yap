import { execSync } from "child_process";

process.env.DATABASE_URL =
  "postgresql://miljab:zaq1%40WSX@localhost:5432/yap_test";

execSync("npx prisma db push --skip-generate --force-reset");
