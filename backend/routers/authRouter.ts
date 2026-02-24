import express from "express";
import { validate } from "../middleware/validate.js";
import {
  signupSchemaWithDb,
  loginSchema,
  onboardingSchema,
} from "../validation/authSchemas.js";
import {
  signup,
  login,
  refresh,
  logout,
  demoUserLogin,
} from "../controllers/authController.js";
import { verifyAccessToken } from "../middleware/verifyAccessToken.js";
import passport from "passport";
import {
  authProcessing,
  oAuthLogin,
  onboarding,
  onboardingUserData,
  cancelOnboarding,
} from "../controllers/oAuthController.js";
import { verifyOnboardingToken } from "../middleware/verifyOnboardingToken.js";
import { verifyRefreshToken } from "../middleware/verifyRefreshToken.js";
import type { RequestHandler } from "express";

const createAuthRouter = ({ authLimiter }: { authLimiter: RequestHandler }) => {
  const router = express.Router();

  router.post("/signup", authLimiter, validate(signupSchemaWithDb), signup);
  router.post("/login", authLimiter, validate(loginSchema), login);
  router.get("/refresh", refresh);
  router.get("/logout", verifyAccessToken, logout);

  router.get(
    "/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false,
    }),
  );

  router.get(
    "/google/callback",
    passport.authenticate("google", {
      failureRedirect: process.env.CLIENT_URL + "/?error=auth-error",
      session: false,
    }),
    oAuthLogin,
  );

  router.get(
    "/github",
    passport.authenticate("github", {
      scope: ["profile", "email"],
      session: false,
    }),
  );

  router.get(
    "/github/callback",
    passport.authenticate("github", {
      failureRedirect: process.env.CLIENT_URL + "/?error=auth-error",
      session: false,
    }),
    oAuthLogin,
  );

  router.get("/onboarding/user", verifyOnboardingToken, onboardingUserData);

  router.post(
    "/onboarding",
    verifyOnboardingToken,
    validate(onboardingSchema),
    onboarding,
  );

  router.delete("/onboarding/cancel", verifyOnboardingToken, cancelOnboarding);

  router.get("/processing", verifyRefreshToken, authProcessing);

  router.get("/demo", demoUserLogin);

  return router;
};

export default createAuthRouter;
