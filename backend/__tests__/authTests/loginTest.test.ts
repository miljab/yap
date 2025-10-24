import app from "../../app.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { prisma } from "../../prisma/prismaClient.js";

describe("POST /auth/login", () => {
  const userData = {
    email: "loginuser@example.com",
    username: "loginuser",
    password: "LoginPassword123",
  };

  beforeEach(async () => {
    await prisma.user.deleteMany();

    await request(app)
      .post("/auth/signup")
      .send({
        ...userData,
        confirmPassword: userData.password,
      });
  });

  it("should login with email and return user, accessToken, and set refreshToken cookie", async () => {
    const res = await request(app).post("/auth/login").send({
      identifier: userData.email,
      password: userData.password,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("user");
    expect(res.body).toHaveProperty("accessToken");
    expect(res.headers["set-cookie"]).toEqual(
      expect.arrayContaining([expect.stringContaining("refreshToken")])
    );
  });

  it("should login with username and return user, accessToken, and set refreshToken cookie", async () => {
    const res = await request(app).post("/auth/login").send({
      identifier: userData.username,
      password: userData.password,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("user");
    expect(res.body).toHaveProperty("accessToken");
    expect(res.headers["set-cookie"]).toEqual(
      expect.arrayContaining([expect.stringContaining("refreshToken")])
    );
  });

  it("should reject wrong password", async () => {
    const res = await request(app).post("/auth/login").send({
      identifier: userData.email,
      password: "WrongPassword",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty(
      "error",
      "Wrong email/username or password"
    );
  });

  it("should reject non-existent user", async () => {
    const res = await request(app).post("/auth/login").send({
      identifier: "nouser@example.com",
      password: "SomePassword123",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty(
      "error",
      "Wrong email/username or password"
    );
  });

  it("should handle internal server error", async () => {
    const { authService } = await import("../../services/authService.js");
    const loginMock = vi
      .spyOn(authService, "login")
      .mockRejectedValueOnce(new Error("fail"));

    const res = await request(app).post("/auth/login").send({
      identifier: userData.email,
      password: userData.password,
    });

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");

    loginMock.mockRestore();
  });

  it("should reject missing identifier", async () => {
    const res = await request(app).post("/auth/login").send({
      password: userData.password,
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: "identifier" })])
    );
  });

  it("should reject missing password", async () => {
    const res = await request(app).post("/auth/login").send({
      identifier: userData.email,
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: "password" })])
    );
  });
});
