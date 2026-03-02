-- CreateIndex
CREATE INDEX "Comment_postId_idx" ON "public"."Comment"("postId");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "public"."Comment"("userId");

-- CreateIndex
CREATE INDEX "Comment_parentId_idx" ON "public"."Comment"("parentId");

-- CreateIndex
CREATE INDEX "Comment_postId_createdAt_idx" ON "public"."Comment"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "CommentLike_commentId_idx" ON "public"."CommentLike"("commentId");

-- CreateIndex
CREATE INDEX "Follow_followerId_idx" ON "public"."Follow"("followerId");

-- CreateIndex
CREATE INDEX "Follow_followingId_idx" ON "public"."Follow"("followingId");

-- CreateIndex
CREATE INDEX "Image_postId_idx" ON "public"."Image"("postId");

-- CreateIndex
CREATE INDEX "Image_commentId_idx" ON "public"."Image"("commentId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "public"."Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "public"."Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "public"."Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Post_userId_idx" ON "public"."Post"("userId");

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "public"."Post"("createdAt");

-- CreateIndex
CREATE INDEX "Post_userId_createdAt_idx" ON "public"."Post"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "PostHistory_postId_idx" ON "public"."PostHistory"("postId");

-- CreateIndex
CREATE INDEX "PostLike_postId_idx" ON "public"."PostLike"("postId");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "public"."RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_revoked_idx" ON "public"."RefreshToken"("userId", "revoked");
