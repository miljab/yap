import type { Request, Response, NextFunction } from "express";
import { MulterError } from "multer";

export const createMulterErrorHandler = (maxFiles: number) => {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof MulterError) {
      const message = err.message;
      if (
        err.code === "LIMIT_FILE_COUNT" ||
        message.includes("Too many files") ||
        message.includes("Unexpected field")
      ) {
        const errorMsg =
          maxFiles === 1
            ? "Only 1 file allowed"
            : `Max ${maxFiles} images allowed`;
        return res.status(400).json({ error: errorMsg });
      }
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "File too large" });
      }
      if (err.code === "LIMIT_FIELD_VALUE") {
        return res.status(400).json({ error: "Invalid field value" });
      }
      return res.status(400).json({ error: err.message });
    }
    next(err);
  };
};
