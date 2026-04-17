/*
  Warnings:

  - You are about to drop the column `actorCount` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `actorId` on the `Notification` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Notification" DROP CONSTRAINT "Notification_actorId_fkey";

-- AlterTable
ALTER TABLE "public"."Notification" DROP COLUMN "actorCount",
DROP COLUMN "actorId";
