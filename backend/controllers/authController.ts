import { type Request, type Response } from "express";
import { authService } from "../services/authService.js";

export const signup = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;
  try {
    const user = await authService.signup({ email, username, password });

    res.status(201).json({ userId: user.id });
  } catch (error: any) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An internal server error occurred during signup." });
  }
};

export const login = async (req: Request, res: Response) => {
  const { identifier, password } = req.body;
  try {
    const { user, accessToken, refreshToken } = await authService.login({
      identifier,
      password,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user: user, accessToken: accessToken });
  } catch (error: any) {
    console.error(error);
    if (error.message === "Invalid credentials") {
      return res
        .status(401)
        .json({ error: "Wrong email/username or password" });
    }
    res
      .status(500)
      .json({ error: "An internal server error occurred during login." });
  }
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) return res.status(401).json({ error: "Unauthorized" });

  try {
    const accessToken = await authService.refresh(refreshToken);

    res.status(200).json({ accessToken });
  } catch (error: any) {
    console.error(error);
    if (error.message === "Invalid refresh token") {
      return res.status(403).json({ error: "Invalid refresh token" });
    }
    res.status(500).json({ error: "Error refreshing access token" });
  }
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) return res.status(401).json({ error: "Unauthorized" });

  try {
    await authService.logout(refreshToken);

    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error logging out" });
  }
};
