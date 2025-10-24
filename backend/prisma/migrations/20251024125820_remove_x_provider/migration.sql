/*
  Warnings:

  - The values [X] on the enum `Provider` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."Provider_new" AS ENUM ('GOOGLE', 'GITHUB');
ALTER TABLE "public"."Account" ALTER COLUMN "provider" TYPE "public"."Provider_new" USING ("provider"::text::"public"."Provider_new");
ALTER TYPE "public"."Provider" RENAME TO "Provider_old";
ALTER TYPE "public"."Provider_new" RENAME TO "Provider";
DROP TYPE "public"."Provider_old";
COMMIT;
