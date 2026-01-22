/*
  Warnings:

  - Added the required column `cloudinaryPublicId` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Image" ADD COLUMN     "cloudinaryPublicId" TEXT NOT NULL;
