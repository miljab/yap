import express from "express";
import request from "supertest";
import cookieParser from "cookie-parser";
import { prisma } from "../../prisma/prismaClient.js";
import createApp from "../../app.js";
import { generateOnboardingToken } from "../../utils/generateTokens.js";
import { describe, beforeAll, beforeEach, test, expect } from "vitest";
import type { User } from "@prisma/client";

type TestUser = Omit<User, "password">;

async function createTestUser(username: string | null, email: string | null) {
  const user = await prisma.user.create({
    data: {
      email: email,
      username: username,
    },
  });

  await prisma.account.create({
    data: {
      userId: user.id,
      provider: "GOOGLE",
      providerAccountId: "google-test-id",
      isPending: true,
    },
  });

  return user;
}

describe("Onboarding Routes", () => {
  let app: express.Express;
  let testUser: TestUser;

  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.account.deleteMany();
  });

  beforeAll(async () => {
    app = createApp({ enableRateLimit: false, enableCsrf: false });
  });

  test("GET /onboarding/user returns user data if authenticated", async () => {
    testUser = await createTestUser(null, "testuser@example.com");
    const onboardingToken = generateOnboardingToken(testUser.id);

    const res = await request(app)
      .get("/auth/onboarding/user")
      .set("Cookie", [`onboardingToken=${onboardingToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("testuser@example.com");
  });

  test("POST /onboarding updates user and returns tokens", async () => {
    testUser = await createTestUser(null, null);
    const onboardingToken = generateOnboardingToken(testUser.id);

    const res = await request(app)
      .post("/auth/onboarding")
      .set("Cookie", [`onboardingToken=${onboardingToken}`])
      .send({ email: "newemail@example.com", username: "newusername" });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("newemail@example.com");
    expect(res.body.user.username).toBe("newusername");
    expect(res.body.accessToken).toBeDefined();
    expect(
      Array.isArray(res.headers["set-cookie"]) &&
        res.headers["set-cookie"].some((cookie: string) =>
          cookie.startsWith("refreshToken=")
        )
    ).toBe(true);
  });

  test("POST /onboarding fails if email already exists", async () => {
    const existingUser = await prisma.user.create({
      data: {
        username: "takenUsername",
        email: "taken@example.com",
        password: "SecurePassword123",
      },
    });

    testUser = await createTestUser(null, null);
    const onboardingToken = generateOnboardingToken(testUser.id);

    const res = await request(app)
      .post("/auth/onboarding")
      .set("Cookie", [`onboardingToken=${onboardingToken}`])
      .send({ email: "taken@example.com", username: "newuser" });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "email",
          error: "Email already in use",
        }),
      ])
    );
  });

  test("POST /onboarding fails if no email is provided", async () => {
    testUser = await createTestUser("nouser", null);
    const onboardingToken = generateOnboardingToken(testUser.id);

    const res = await request(app)
      .post("/auth/onboarding")
      .set("Cookie", [`onboardingToken=${onboardingToken}`])
      .send({ username: "nouser" });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "email", error: expect.any(String) }),
      ])
    );
  });

  test("POST /onboarding fails if username already exists", async () => {
    const existingUser = await prisma.user.create({
      data: {
        username: "takenUsername",
        email: "taken@example.com",
        password: "SecurePassword123",
      },
    });

    testUser = await createTestUser(null, "newemail@example.com");
    const onboardingToken = generateOnboardingToken(testUser.id);

    const res = await request(app)
      .post("/auth/onboarding")
      .set("Cookie", [`onboardingToken=${onboardingToken}`])
      .send({ email: "newemail@example.com", username: "takenUsername" });

    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "username",
          error: "Username already in use",
        }),
      ])
    );
  });

  test("DELETE /onboarding/cancel deletes user and clears cookie", async () => {
    testUser = await createTestUser(null, "canceluser@example.com");
    const onboardingToken = generateOnboardingToken(testUser.id);

    const res = await request(app)
      .delete("/auth/onboarding/cancel")
      .set("Cookie", [`onboardingToken=${onboardingToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Onboarding cancelled");

    const deleted = await prisma.user.findUnique({
      where: { id: testUser.id },
    });

    expect(deleted).toBeNull();
  });
});
