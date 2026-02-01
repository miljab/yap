import { prisma } from "../prisma/prismaClient.js";
import AppError from "../utils/appError.js";

export const userService = {
  getUserProfile: async (username: string) => {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
      include: {
        posts: true,
        comments: true,
        postLikes: true,
        commentLikes: true,
      },
    });

    if (!user) throw new AppError("User not found", 404);

    return user;
  },
};
