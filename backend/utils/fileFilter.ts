import { fileTypeFromFile } from "file-type";
import multer from "multer";
import { ALLOWED_IMAGE_MIME } from "./constants.js";

const ALLOWED_FILE_TYPES = ["png", "jpeg", "jpg", "gif", "webp"];

export async function validateImageMagicBytes(
  file: Express.Multer.File,
): Promise<boolean> {
  try {
    const fileTypeResult = await fileTypeFromFile(file.path);

    if (!fileTypeResult) {
      return false;
    }

    return ALLOWED_FILE_TYPES.includes(fileTypeResult.ext);
  } catch {
    return false;
  }
}

export const imageFileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (ALLOWED_IMAGE_MIME.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (png,jpg,jpeg,webp,gif) are allowed"));
  }
};
