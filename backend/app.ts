import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import createAuthRouter from "./routers/authRouter.js";
import createUserRouter from "./routers/userRouter.js";
import createPostRouter from "./routers/postRouter.js";
import passport from "passport";
import "./passport/googlePassport.js";
import "./passport/githubPassport.js";
import createCommentRouter from "./routers/commentRouter.js";
import {
  createAuthLimiter,
  createGlobalLimiter,
  createWriteLimiter,
} from "./middleware/rateLimiter.js";

export function createApp({ enableRateLimit = true } = {}) {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    }),
  );

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(passport.initialize());

  const globalLimiter = createGlobalLimiter(enableRateLimit);
  const authLimiter = createAuthLimiter(enableRateLimit);
  const writeLimiter = createWriteLimiter(enableRateLimit);

  app.use(globalLimiter);

  app.use("/auth", createAuthRouter({ authLimiter }));
  app.use(createPostRouter({ writeLimiter }));
  app.use(createCommentRouter({ writeLimiter }));
  app.use(createUserRouter());

  return app;
}

export default createApp;
