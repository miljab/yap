import app from "../app.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { prisma } from "../prisma/prismaClient.js";

describe("GET /auth/refresh", () => {
  let refreshTokenCookie: string[];

  const userData = {
    email: "refreshuser@example.com",
    username: "refreshuser",
    password: "RefreshPassword123",
  };

  beforeEach(async () => {
    await prisma.user.deleteMany();
    await request(app)
      .post("/auth/signup")
      .send({
        ...userData,
        confirmPassword: userData.password,
      });

    const loginRes = await request(app).post("/auth/login").send({
      identifier: userData.email,
      password: userData.password,
    });

    const setCookieHeader = loginRes.headers["set-cookie"];
    if (!setCookieHeader) {
      throw new Error("No set-cookie header found");
    }
    if (Array.isArray(setCookieHeader)) {
      refreshTokenCookie = setCookieHeader;
    } else {
      refreshTokenCookie = [setCookieHeader];
    }

    if (!Array.isArray(refreshTokenCookie)) {
      throw new Error("Expected array of cookies");
    }
  });

  it("should return new access token for valid refresh token", async () => {
    const res = await request(app)
      .get("/auth/refresh")
      .set("Authorization", "Bearer oldAccessToken")
      .set("Cookie", refreshTokenCookie);

    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user).toBeDefined();
  });

  it("should return 401 if refresh token is missing", async () => {
    const res = await request(app)
      .get("/auth/refresh")
      .set("Authorization", "Bearer someAccessToken");

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  it("should return 403 for invalid refresh token", async () => {
    const res = await request(app)
      .get("/auth/refresh")
      .set("Authorization", "Bearer someAccessToken")
      .set("Cookie", ["refreshToken=invalidToken"]);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe("Invalid refresh token");
  });
});
