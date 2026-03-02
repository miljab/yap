import fs from "fs";
import type { File } from "@types/multer";
import multer from "multer";
import { ALLOWED_IMAGE_MIME } from "./constants.js";

const MAGIC_BYTES: Record<string, number[]> = {
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  jpeg: [0xff, 0xd8, 0xff],
  gif: [0x47, 0x49, 0x46, 0x38],
  webp: [0x52, 0x49, 0x46, 0x46],
};

const WEBP_MAGIC_BYTES = [0x57, 0x45, 0x42, 0x50];

function checkMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;

  for (const [format, magic] of Object.entries(MAGIC_BYTES)) {
    const isMatch = magic.every((byte, i) => buffer[i] === byte);
    if (isMatch) {
      if (format === "webp") {
        return WEBP_MAGIC_BYTES.every(
          (byte, i) => buffer[i + 8] === byte,
        );
      }
      return true;
    }
  }

  return false;
}

export function validateImageMagicBytes(file: File): boolean {
  const buffer = Buffer.alloc(12);
  const fd = fs.openSync(file.path, "r");
  fs.readSync(fd, buffer, 0, 12, 0);
  fs.closeSync(fd);

  return checkMagicBytes(buffer);
}

export const imageFileFilter = (
  req: Express.Request,
  file: File,
  cb: multer.FileFilterCallback,
) => {
  if (ALLOWED_IMAGE_MIME.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only image files (png,jpg,jpeg,webp,gif) are allowed"),
    );
  }
};
