import express from "express";
import { validate } from "../middleware/validate.js";
import { signupSchemaWithDb, loginSchema } from "../validation/authSchemas.js";
import {
  signup,
  login,
  refresh,
  logout,
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/signup", validate(signupSchemaWithDb), signup);
router.post("/login", validate(loginSchema), login);
router.get("/refresh", refresh);
router.get("/logout", verifyToken, logout);

export default router;
