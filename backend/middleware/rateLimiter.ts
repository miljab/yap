import "dotenv/config";
import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";

const isTest = process.env.NODE_ENV === "test";

let skipRateLimiting = isTest;
let keyPrefix = "";

export function setSkipRateLimiting(skip: boolean) {
  skipRateLimiting = skip;
}

export function resetRateLimitCounters() {
  keyPrefix = `test-${Date.now()}-`;
}

const testSkip = (_req: Request, _res: Response) => skipRateLimiting;

const testKeyGenerator = (req: Request) => {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  return keyPrefix + ip;
};

export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
  skip: testSkip,
  keyGenerator: testKeyGenerator,
});

export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many login attempts, please try again later." },
  skip: testSkip,
  keyGenerator: testKeyGenerator,
});

export const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests, please slow down." },
  skip: testSkip,
  keyGenerator: testKeyGenerator,
});
