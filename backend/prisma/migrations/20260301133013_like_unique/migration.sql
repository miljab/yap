/*
  Warnings:

  - The primary key for the `CommentLike` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `PostLike` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[userId,commentId]` on the table `CommentLike` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,postId]` on the table `PostLike` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."CommentLike" DROP CONSTRAINT "CommentLike_pkey",
ADD CONSTRAINT "CommentLike_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."PostLike" DROP CONSTRAINT "PostLike_pkey",
ADD CONSTRAINT "PostLike_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "CommentLike_userId_commentId_key" ON "public"."CommentLike"("userId", "commentId");

-- CreateIndex
CREATE UNIQUE INDEX "PostLike_userId_postId_key" ON "public"."PostLike"("userId", "postId");
