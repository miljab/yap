import type { Image } from "@prisma/client";
import cloudinary from "../config/cloudinary.js";
import fs from "fs/promises";
import { nanoid } from "nanoid";

export const uploadImages = async (
  images: Express.Multer.File[],
  folder: string,
) => {
  const imagesCloudinaryData = [];

  for (const image of images) {
    const result = await cloudinary.uploader.upload(image.path, {
      folder: folder,
      public_id: nanoid(),
    });
    imagesCloudinaryData.push({
      url: result.secure_url,
      publicId: result.public_id,
    });

    await fs.unlink(image.path);
  }

  const imagesDbData = imagesCloudinaryData.map((image, idx) => ({
    url: image.url,
    cloudinaryPublicId: image.publicId,
    orderIndex: idx,
  }));

  return imagesDbData;
};
