import app from "../app.js";
import { vi, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { prisma } from "../prisma/prismaClient.js";
import { resetRateLimitCounters } from "../middleware/rateLimiter.js";

vi.mock("../utils/cloudinaryHelper.js", () => ({
  uploadImages: vi.fn().mockImplementation(async (images) => {
    return images.map((_: any, idx: number) => ({
      url: `https://fake-cloudinary.com/image${idx}.jpg`,
      cloudinaryPublicId: `fake-public-id-${idx}`,
      orderIndex: idx,
    }));
  }),
  deleteImages: vi.fn().mockResolvedValue(undefined),
}));

beforeAll(async () => {
  resetRateLimitCounters();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.post.deleteMany();
});

describe("Rate Limiting - writeLimiter (30 req/min)", () => {
  const userData = {
    email: "rateuser@example.com",
    username: "rateuser",
    password: "RateUser123",
  };

  let accessToken: string;

  beforeEach(async () => {
    resetRateLimitCounters();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
    await prisma.post.deleteMany();

    await request(app)
      .post("/auth/signup")
      .send({ ...userData, confirmPassword: userData.password });

    const loginRes = await request(app).post("/auth/login").send({
      identifier: userData.email,
      password: userData.password,
    });
    accessToken = loginRes.body.accessToken;
  });

  it("should allow requests within the limit", async () => {
    for (let i = 0; i < 5; i++) {
      const res = await request(app)
        .post("/post/new")
        .set("Authorization", `Bearer ${accessToken}`)
        .field("text", `Post ${i}`);
      expect(res.statusCode).toBe(201);
    }
  });

  it("should return 429 when write limit is exceeded", async () => {
    const requests = [];
    for (let i = 0; i < 31; i++) {
      requests.push(
        request(app)
          .post("/post/new")
          .set("Authorization", `Bearer ${accessToken}`)
          .field("text", `Post ${i}`),
      );
    }

    const responses = await Promise.all(requests);
    const lastResponse = responses[30];

    expect(lastResponse?.statusCode).toBe(429);
    expect(lastResponse?.body).toHaveProperty(
      "error",
      "Too many requests, please slow down.",
    );
  });
});

describe("Rate Limiting - authLimiter (10 req/min)", () => {
  const userData = {
    email: "authrate@example.com",
    username: "authrate",
    password: "AuthRate123",
  };

  beforeEach(async () => {
    resetRateLimitCounters();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();

    await request(app)
      .post("/auth/signup")
      .send({ ...userData, confirmPassword: userData.password });
  });

  it("should allow login attempts within the limit", async () => {
    for (let i = 0; i < 3; i++) {
      const res = await request(app).post("/auth/login").send({
        identifier: userData.email,
        password: userData.password,
      });
      expect(res.statusCode).toBe(200);
    }
  });

  it("should return 429 when auth limit is exceeded", async () => {
    const requests = [];
    for (let i = 0; i < 11; i++) {
      requests.push(
        request(app).post("/auth/login").send({
          identifier: userData.email,
          password: userData.password,
        }),
      );
    }

    const responses = await Promise.all(requests);
    const lastResponse = responses[10];

    expect(lastResponse?.statusCode).toBe(429);
    expect(lastResponse?.body).toHaveProperty(
      "error",
      "Too many login attempts, please try again later.",
    );
  });
});

describe("Rate Limiting - globalLimiter (100 req/min)", () => {
  const userData = {
    email: "globalrate@example.com",
    username: "globalrate",
    password: "GlobalRate123",
  };

  let accessToken: string;

  beforeEach(async () => {
    resetRateLimitCounters();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();

    await request(app)
      .post("/auth/signup")
      .send({ ...userData, confirmPassword: userData.password });

    const loginRes = await request(app).post("/auth/login").send({
      identifier: userData.email,
      password: userData.password,
    });
    accessToken = loginRes.body.accessToken;
  });

  it("should allow read requests within the limit", async () => {
    const postRes = await request(app)
      .post("/post/new")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "Test post");
    const postId = postRes.body.id;

    for (let i = 0; i < 10; i++) {
      const res = await request(app)
        .get(`/post/${postId}`)
        .set("Authorization", `Bearer ${accessToken}`);
      expect(res.statusCode).toBe(200);
    }
  });

  it("should return 429 when global limit is exceeded", async () => {
    const postRes = await request(app)
      .post("/post/new")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "Test post");
    const postId = postRes.body.id;

    const requests = [];
    for (let i = 0; i < 101; i++) {
      requests.push(
        request(app)
          .get(`/post/${postId}`)
          .set("Authorization", `Bearer ${accessToken}`),
      );
    }

    const responses = await Promise.all(requests);
    const lastResponse = responses[100];

    expect(lastResponse?.statusCode).toBe(429);
    expect(lastResponse?.body).toHaveProperty(
      "error",
      "Too many requests, please try again later.",
    );
  });
});
