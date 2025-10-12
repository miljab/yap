import "dotenv/config";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const ONBOARDING_TOKEN_SECRET = process.env.ONBOARDING_TOKEN_SECRET!;

export function generateAccessToken(userId: string) {
  return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
}

export function generateRefreshToken(userId: string) {
  return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
}

export function generateOnboardingToken(userId: string) {
  return jwt.sign({ userId }, ONBOARDING_TOKEN_SECRET, {
    expiresIn: "15m",
  });
}
