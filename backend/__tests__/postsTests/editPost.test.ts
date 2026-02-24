import createApp from "../../app.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { prisma } from "../../prisma/prismaClient.js";

const app = createApp({ enableRateLimit: false });

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

describe("PUT /post/:id", () => {
  const userData = {
    email: "edituser@example.com",
    username: "edituser",
    password: "EditUser123",
  };

  let accessToken: string;
  let postId: string;

  beforeEach(async () => {
    await prisma.user.deleteMany();

    await request(app)
      .post("/auth/signup")
      .send({ ...userData, confirmPassword: userData.password });

    const loginRes = await request(app).post("/auth/login").send({
      identifier: userData.email,
      password: userData.password,
    });
    accessToken = loginRes.body.accessToken;

    const postRes = await request(app)
      .post("/post/new")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "Original content");
    postId = postRes.body.id;
  });

  it("should update post content", async () => {
    const res = await request(app)
      .put(`/post/${postId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ content: "Updated content" });

    expect(res.statusCode).toBe(200);
    expect(res.body.content).toBe("Updated content");
  });

  it("should reject content exceeding 200 characters", async () => {
    const longContent = "a".repeat(201);

    const res = await request(app)
      .put(`/post/${postId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ content: longContent });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Max 200 characters allowed");
  });

  it("should reject empty content when post has no images", async () => {
    const res = await request(app)
      .put(`/post/${postId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ content: "" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Text or images are required");
  });

  it("should allow empty content when post has images", async () => {
    const postWithImageRes = await request(app)
      .post("/post/new")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "Post with image")
      .attach("images", Buffer.from(pngImageBase64, "base64"), "test.png");
    const postWithImageId = postWithImageRes.body.id;

    const res = await request(app)
      .put(`/post/${postWithImageId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ content: "" });

    expect(res.statusCode).toBe(200);
  });

  it("should return 404 for non-existent post", async () => {
    const res = await request(app)
      .put("/post/non-existent-id")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ content: "New content" });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error", "Post not found");
  });

  it("should return 403 when user is not post owner", async () => {
    await request(app)
      .post("/auth/signup")
      .send({
        email: "other@example.com",
        username: "otheruser",
        confirmPassword: "Other123",
      });

    const otherLogin = await request(app).post("/auth/login").send({
      identifier: "other@example.com",
      password: "Other123",
    });
    const otherToken = otherLogin.body.accessToken;

    const res = await request(app)
      .put(`/post/${postId}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ content: "Hacked content" });

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 401 without auth", async () => {
    const res = await request(app)
      .put(`/post/${postId}`)
      .send({ content: "New content" });

    expect(res.statusCode).toBe(401);
  });

  it("should handle internal server error", async () => {
    const { postService } = await import("../../services/postService.js");
    const updatePostMock = vi
      .spyOn(postService, "updatePost")
      .mockRejectedValueOnce(new Error("fail"));

    const res = await request(app)
      .put(`/post/${postId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ content: "New content" });

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");

    updatePostMock.mockRestore();
  });
});
