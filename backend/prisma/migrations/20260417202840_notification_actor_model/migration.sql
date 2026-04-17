-- CreateTable
CREATE TABLE "public"."NotificationActor" (
    "notificationId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationActor_pkey" PRIMARY KEY ("notificationId","actorId")
);

-- AddForeignKey
ALTER TABLE "public"."NotificationActor" ADD CONSTRAINT "NotificationActor_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "public"."Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NotificationActor" ADD CONSTRAINT "NotificationActor_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
