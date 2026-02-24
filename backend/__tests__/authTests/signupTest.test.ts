import createApp from "../../app.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { prisma } from "../../prisma/prismaClient.js";

const app = createApp({ enableRateLimit: false, enableCsrf: false });

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
    const { authService } = await import("../../services/authService.js");
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
      expect(res.body.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: "username" })])
      );
    });

    it("should reject too short username", async () => {
      const res = await request(app).post("/auth/signup").send({
        email: "testuser@example.com",
        username: "aa",
        password: "SecurePassword123",
        confirmPassword: "SecurePassword123",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: "username" })])
      );
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
      expect(res.body.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: "username" })])
      );
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
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          {
            path: "username",
            error: "Username already in use",
          },
        ])
      );
    });
  });

  describe("Email validation", () => {
    it("should reject invalid email format", async () => {
      const res = await request(app).post("/auth/signup").send({
        email: "wrongEmail",
        username: "testuser",
        password: "SecurePassword123",
        confirmPassword: "SecurePassword123",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: "email" })])
      );
    });

    it("should reject taken email", async () => {
      await request(app).post("/auth/signup").send({
        email: "testuser@example.com",
        username: "testuser",
        password: "SecurePassword123",
        confirmPassword: "SecurePassword123",
      });

      const res = await request(app).post("/auth/signup").send({
        email: "testuser@example.com",
        username: "anotherUser",
        password: "SecurePassword123",
        confirmPassword: "SecurePassword123",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          {
            path: "email",
            error: "Email already in use",
          },
        ])
      );
    });
  });

  describe("Password validation", () => {
    it("should reject too short password", async () => {
      const res = await request(app).post("/auth/signup").send({
        email: "testuser@example.com",
        username: "testuser",
        password: "Sh0rt",
        confirmPassword: "Sh0rt",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: "password" })])
      );
    });

    it("should reject too long password", async () => {
      const res = await request(app)
        .post("/auth/signup")
        .send({
          email: "testuser@example.com",
          username: "testuser",
          password: "Aa1".repeat(25),
          confirmPassword: "Aa1".repeat(25),
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: "password" })])
      );
    });

    it("should reject password without at least one uppercase character", async () => {
      const res = await request(app).post("/auth/signup").send({
        email: "testuser@example.com",
        username: "testuser",
        password: "password1",
        confirmPassword: "password1",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: "password" })])
      );
    });

    it("should reject password without at least one number", async () => {
      const res = await request(app).post("/auth/signup").send({
        email: "testuser@example.com",
        username: "testuser",
        password: "Password",
        confirmPassword: "Password",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ path: "password" })])
      );
    });

    it("should reject not matching passwords", async () => {
      const res = await request(app).post("/auth/signup").send({
        email: "testuser@example.com",
        username: "testuser",
        password: "SecurePassword123",
        confirmPassword: "NotMatchingPassword123",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: "confirmPassword" }),
        ])
      );
    });
  });
});
