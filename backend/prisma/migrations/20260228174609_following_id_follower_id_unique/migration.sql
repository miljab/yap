/*
  Warnings:

  - A unique constraint covering the columns `[followingId,followerId]` on the table `Follow` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Follow_followingId_followerId_key" ON "public"."Follow"("followingId", "followerId");
