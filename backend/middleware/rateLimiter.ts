import rateLimit from "express-rate-limit";

export const createGlobalLimiter = (enabled = true) => {
  return rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
    skip: () => !enabled,
  });
};

export const createAuthLimiter = (enabled = true) => {
  return rateLimit({
    windowMs: 60 * 1000,
    limit: 10,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many login attempts, please try again later." },
    skip: () => !enabled,
  });
};

export const createWriteLimiter = (enabled = true) => {
  return rateLimit({
    windowMs: 60 * 1000,
    limit: 30,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many requests, please slow down." },
    skip: () => !enabled,
  });
};
