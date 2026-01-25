import "dotenv/config";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  omit: {
    user: {
      password: true,
    },
  },
}).$extends({
  result: {
    user: {
      avatar: {
        needs: { avatar: true },
        compute(user) {
          return user.avatar ?? process.env.DEFAULT_AVATAR_URL!;
        },
      },
    },
  },
});
