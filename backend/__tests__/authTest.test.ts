import app from "../app.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { prisma } from "../prisma/prismaClient.js";

describe("POST /auth/signup", () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  it("should create a new user and return userId", async () => {
    const res = await request(app).post("/auth/signup").send({
      email: "testuser@example.com",
      username: "testuser",
      password: "SecurePassword123",
      confirmPassword: "SecurePassword123",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("userId");
  });

  it("should handle internal server error", async () => {
    const { authService } = await import("../services/authService.js");
    const signupMock = vi
      .spyOn(authService, "signup")
      .mockRejectedValueOnce(new Error("fail"));

    const res = await request(app).post("/auth/signup").send({
      email: "testuser@example.com",
      username: "testuser",
      password: "SecurePassword123",
      confirmPassword: "SecurePassword123",
    });

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");

    signupMock.mockRestore();
  });

  describe("Username validation", () => {
    it("should reject forbidden characters in username", async () => {
      const res = await request(app).post("/auth/signup").send({
        email: "testuser@example.com",
        username: "wrong!name",
        password: "SecurePassword123",
        confirmPassword: "SecurePassword123",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });

    it("should reject too short username", async () => {
      const res = await request(app).post("/auth/signup").send({
        email: "testuser@example.com",
        username: "aa",
        password: "SecurePassword123",
        confirmPassword: "SecurePassword123",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });

    it("should reject too long username", async () => {
      const res = await request(app)
        .post("/auth/signup")
        .send({
          email: "testuser@example.com",
          username: "a".repeat(37),
          password: "SecurePassword123",
          confirmPassword: "SecurePassword123",
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });

    it("should reject taken username", async () => {
      await request(app).post("/auth/signup").send({
        email: "taken@example.com",
        username: "takenUsername",
        password: "SecurePassword123",
        confirmPassword: "SecurePassword123",
      });

      const res = await request(app).post("/auth/signup").send({
        email: "testuser@example.com",
        username: "takenUsername",
        password: "SecurePassword123",
        confirmPassword: "SecurePassword123",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });
  });
});
