import cloudinary from "../config/cloudinary.js";
import { nanoid } from "nanoid";
import { prisma } from "../prisma/prismaClient.js";

export const postService = {
  createPost: async ({
    userId,
    text,
    images,
  }: {
    userId: string;
    text: string;
    images: Express.Multer.File[];
  }) => {
    try {
      let imageUrls = [];

      if (images && images.length > 0) {
        if (images.length > 4) throw new Error("Max 4 images allowed");

        for (const image of images) {
          const result = await cloudinary.uploader.upload(image.path, {
            folder: "post-images",
            public_id: nanoid(),
          });
          imageUrls.push(result.secure_url);
        }
      }

      const imagesData = imageUrls.map((url, idx) => ({
        url,
        orderIndex: idx,
      }));

      const post = await prisma.post.create({
        data: {
          content: text,
          userId,
          images: {
            create: imagesData,
          },
        },
        include: {
          images: true,
        },
      });

      return post;
    } catch (error) {
      throw error;
    }
  },
};
