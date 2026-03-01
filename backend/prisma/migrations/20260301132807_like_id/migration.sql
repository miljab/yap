/*
  Warnings:

  - The required column `id` was added to the `CommentLike` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `id` was added to the `PostLike` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "public"."CommentLike" ADD COLUMN     "id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."PostLike" ADD COLUMN     "id" TEXT NOT NULL;
