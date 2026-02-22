import "dotenv/config";
import rateLimit from "express-rate-limit";

const isTest = process.env.NODE_ENV === "test";

export const globalLimiter = isTest
  ? (_req: any, _res: any, next: any) => next()
  : rateLimit({
      windowMs: 60 * 1000,
      limit: 100,
      standardHeaders: "draft-7",
      legacyHeaders: false,
      message: { error: "Too many requests, please try again later." },
    });

export const authLimiter = isTest
  ? (_req: any, _res: any, next: any) => next()
  : rateLimit({
      windowMs: 60 * 1000,
      limit: 10,
      standardHeaders: "draft-7",
      legacyHeaders: false,
      message: { error: "Too many login attempts, please try again later." },
    });

export const writeLimiter = isTest
  ? (_req: any, _res: any, next: any) => next()
  : rateLimit({
      windowMs: 60 * 1000,
      limit: 30,
      standardHeaders: "draft-7",
      legacyHeaders: false,
      message: { error: "Too many requests, please slow down." },
    });
