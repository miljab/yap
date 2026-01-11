import { prisma } from "../prisma/prismaClient.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs/promises";
import { nanoid } from "nanoid";

const commentService = {
  replyToPost: async (
    userId: string,
    postId: string,
    text: string,
    images: Express.Multer.File[]
  ) => {
    try {
      console.log(postId);
      let imageUrls = [];

      for (const image of images) {
        const result = await cloudinary.uploader.upload(image.path, {
          folder: "comment-images",
          public_id: nanoid(),
        });
        imageUrls.push(result.secure_url);

        await fs.unlink(image.path);
      }

      const imagesData = imageUrls.map((url, idx) => ({
        url,
        orderIndex: idx,
      }));

      const comment = await prisma.comment.create({
        data: {
          content: text,
          postId,
          userId,
          images: {
            create: imagesData,
          },
        },
        include: {
          images: true,
        },
      });

      return comment;
    } catch (error) {
      throw error;
    }
  },

  getComments: async (postId: string) => {
    try {
      const comments = await prisma.comment.findMany({
        where: {
          postId,
        },
        include: {
          images: true,
          user: true,
        },
      });

      return comments;
    } catch (error) {
      throw error;
    }
  },
};

export default commentService;
