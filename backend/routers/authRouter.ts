import express from "express";
import type { Request, Response } from "express";
import { validate } from "../middleware/validate.js";
import {
  signupSchemaWithDb,
  loginSchema,
  usernameSchema,
} from "../validation/authSchemas.js";
import {
  signup,
  login,
  refresh,
  logout,
} from "../controllers/authController.js";
import { verifyAccessToken } from "../middleware/verifyAccessToken.js";
import passport from "passport";
import {
  authProcessing,
  oAuthLogin,
  onboarding,
} from "../controllers/oAuthController.js";
import { verifyOnboardingToken } from "../middleware/verifyOnboardingToken.js";
import { verifyRefreshToken } from "../middleware/verifyRefreshToken.js";

const router = express.Router();

router.post("/signup", validate(signupSchemaWithDb), signup);
router.post("/login", validate(loginSchema), login);
router.get("/refresh", refresh);
router.get("/logout", verifyAccessToken, logout);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: process.env.CLIENT_URL + "/?error=auth-error",
    session: false,
  }),
  oAuthLogin
);

router.post(
  "/onboarding",
  verifyOnboardingToken,
  validate(usernameSchema),
  onboarding
);

router.get("/auth/processing", verifyRefreshToken, authProcessing);

export default router;
