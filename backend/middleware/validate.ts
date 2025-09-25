import { type Request, type Response, type NextFunction } from "express";
import { ZodError, type ZodObject, type ZodRawShape } from "zod";

export const validate =
  (schema: ZodObject<ZodRawShape>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await schema.parseAsync(req.body);
      req.body = result;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.issues.map((issue) => ({
          path: issue.path.join(".") || "root",
          error: issue.message,
        }));

        return res.status(400).json({ errors });
      }

      next(err);
    }
  };
