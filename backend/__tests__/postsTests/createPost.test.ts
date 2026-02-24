import createApp from "../../app.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { prisma } from "../../prisma/prismaClient.js";

const app = createApp({ enableRateLimit: false, enableCsrf: false });

const pngImageBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

vi.mock("../../utils/cloudinaryHelper.js", () => ({
  uploadImages: vi.fn().mockImplementation(async (images) => {
    return images.map((_: any, idx: number) => ({
      url: `https://fake-cloudinary.com/image${idx}.jpg`,
      cloudinaryPublicId: `fake-public-id-${idx}`,
      orderIndex: idx,
    }));
  }),
  deleteImages: vi.fn().mockResolvedValue(undefined),
}));

describe("POST /post/new", () => {
  const userData = {
    email: "postuser@example.com",
    username: "postuser",
    password: "PostUser123",
  };

  let accessToken: string;

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
  });

  it("should create a post with text", async () => {
    const res = await request(app)
      .post("/post/new")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "Hello world!");

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.content).toBe("Hello world!");
  });

  it("should reject post without text nor images", async () => {
    const res = await request(app)
      .post("/post/new")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "");

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Text or images are required");
  });

  it("should reject post with whitespace-only text", async () => {
    const res = await request(app)
      .post("/post/new")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "   ");

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Text or images are required");
  });

  it("should create a post with images only", async () => {
    const res = await request(app)
      .post("/post/new")
      .set("Authorization", `Bearer ${accessToken}`)
      .attach("images", Buffer.from(pngImageBase64, "base64"), "test.png");

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.images).toHaveLength(1);
  });

  it("should create a post with text and images", async () => {
    const res = await request(app)
      .post("/post/new")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "Check out this image!")
      .attach("images", Buffer.from(pngImageBase64, "base64"), "test.png");

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.content).toBe("Check out this image!");
    expect(res.body.images).toHaveLength(1);
  });

  it("should reject more than 4 images", async () => {
    const req = request(app)
      .post("/post/new")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "Many images");

    for (let i = 0; i < 5; i++) {
      req.attach(
        "images",
        Buffer.from(pngImageBase64, "base64"),
        `img${i}.png`,
      );
    }

    const res = await req;

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Max 4 images allowed");
  });

  it("should reject text exceeding 200 characters", async () => {
    const longText = "a".repeat(201);

    const res = await request(app)
      .post("/post/new")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", longText);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Max 200 characters allowed");
  });

  it("should reject unauthenticated request", async () => {
    const res = await request(app)
      .post("/post/new")
      .field("text", "Hello world!");

    expect(res.statusCode).toBe(401);
  });

  it("should handle internal server error", async () => {
    const { postService } = await import("../../services/postService.js");
    const createPostMock = vi
      .spyOn(postService, "createPost")
      .mockRejectedValueOnce(new Error("fail"));

    const res = await request(app)
      .post("/post/new")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "Test post");

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");

    createPostMock.mockRestore();
  });
});
