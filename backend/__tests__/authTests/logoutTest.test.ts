import createApp from "../../app.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { prisma } from "../../prisma/prismaClient.js";

const app = createApp({ enableRateLimit: false });

describe("GET /auth/logout", () => {
  let accessToken: string;
  let refreshTokenCookie: string[];

  const userData = {
    email: "logoutuser@example.com",
    username: "logoutuser",
    password: "LogoutPassword123",
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

    accessToken = loginRes.body.accessToken;

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

  it("should logout successfully and clear refreshToken cookie", async () => {
    const res = await request(app)
      .get("/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Cookie", refreshTokenCookie);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Logout successful");
    expect(res.headers["set-cookie"]).toEqual(
      expect.arrayContaining([expect.stringContaining("refreshToken=;")])
    );
  });

  it("should reject logout if refreshToken cookie is missing", async () => {
    const res = await request(app)
      .get("/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error", "Unauthorized");
  });

  it("should reject logout if refreshToken is invalid", async () => {
    const res = await request(app)
      .get("/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Cookie", ["refreshToken=invalidtoken"]);

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");
  });

  it("should handle internal server error", async () => {
    const { authService } = await import("../../services/authService.js");
    const logoutMock = vi
      .spyOn(authService, "logout")
      .mockRejectedValueOnce(new Error("fail"));

    const res = await request(app)
      .get("/auth/logout")
      .set("Authorization", `Bearer ${accessToken}`)
      .set("Cookie", refreshTokenCookie);

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");

    logoutMock.mockRestore();
  });
});
