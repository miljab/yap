import "dotenv/config";
import type { User } from "@prisma/client";
import type { Request, Response } from "express";
import { oAuthService } from "../services/oAuthService.js";
import {
  generateAccessToken,
  generateOnboardingToken,
} from "../utils/generateTokens.js";

export async function oAuthLogin(req: Request, res: Response) {
  try {
    const user = req.user as User;

    if (!user)
      return res
        .status(401)
        .redirect(process.env.CLIENT_URL + "/?error=auth-error");

    const isPending = oAuthService.isPending(user.id);

    if (!isPending) {
      const refreshToken = await oAuthService.createRefreshToken(user.id);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res
        .status(200)
        .redirect(process.env.CLIENT_URL + "/auth/processing");
    }

    res.cookie("onboardingToken", generateOnboardingToken(user.id), {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.redirect(process.env.CLIENT_URL + "/onboarding");
  } catch (error) {
    console.error(error);
    res.status(500).redirect(process.env.CLIENT_URL + "/?error=auth-error");
  }
}

export async function authProcessing(req: Request, res: Response) {
  try {
    const user = req.user as User;

    if (!user) return res.status(401).json({ error: "User not found" });

    const accessToken = generateAccessToken(user.id);

    res.status(200).json({ user, accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function onboarding(req: Request, res: Response) {
  try {
    const user = req.user as User;
    const username = req.body.username;

    const { accessToken, refreshToken } = await oAuthService.onboard(
      user.id,
      username
    );

    res.clearCookie("onboardingToken");

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ user, accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}
