import request from "supertest";
import express from "express";
import { oAuthLogin } from "../../controllers/oAuthController.js";
import { describe, it, expect, vi } from "vitest";

const app = express();
app.use(express.json());

app.get(
  "/test-oauth-login",
  (req, res, next) => {
    req.user = {
      id: 123,
      email: "testuser@example.com",
    };
    next();
  },
  oAuthLogin
);

describe("oAuthLogin", () => {
  it("should redirect to /auth/processing if user is not pending", async () => {
    const { oAuthService } = await import("../../services/oAuthService.js");
    oAuthService.isPending = vi.fn().mockResolvedValue(false);
    oAuthService.createRefreshToken = vi
      .fn()
      .mockResolvedValue("mock-refresh-token");

    const response = await request(app).get("/test-oauth-login");

    expect(response.status).toBe(302);
    expect(response.headers["set-cookie"]).toEqual(
      expect.arrayContaining([
        expect.stringContaining("refreshToken=mock-refresh-token"),
      ])
    );
    expect(response.headers["location"]).toContain("/auth/processing");
  });

  it("should redirect to /onboarding if user is pending", async () => {
    const { oAuthService } = await import("../../services/oAuthService.js");
    oAuthService.isPending = vi.fn().mockResolvedValue(true);

    const response = await request(app).get("/test-oauth-login");

    expect(response.status).toBe(302);
    expect(response.headers["location"]).toContain("/onboarding");
  });

  it("should redirect to error if no user", async () => {
    const appNoUser = express();
    appNoUser.get("/test-oauth-login", oAuthLogin);

    const response = await request(appNoUser).get("/test-oauth-login");

    expect(response.status).toBe(302);
    expect(response.headers["location"]).toContain("/?error=auth-error");
  });
});
