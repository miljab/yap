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
import { oAuthLogin, onboarding } from "../controllers/oAuthController.js";
import { verifyOnboardingToken } from "../middleware/verifyOboardingToken.js";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

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
    failureRedirect: process.env.CLIENT_URL + "?error=auth-error",
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

export default router;
