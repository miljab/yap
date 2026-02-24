import createApp from "../../app.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { prisma } from "../../prisma/prismaClient.js";

const app = createApp({ enableRateLimit: false });

const pngImageBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

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

describe("POST /comment/:id/reply", () => {
  const userData = {
    email: "nestedcommentuser@example.com",
    username: "nestedcommentuser",
    password: "NestedComment123",
  };

  let accessToken: string;
  let postId: string;
  let parentCommentId: string;

  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.post.deleteMany();
    await prisma.comment.deleteMany();

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
      .field("text", "Test post for nested comments");
    postId = postRes.body.id;

    const commentRes = await request(app)
      .post(`/post/${postId}/reply`)
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "Parent comment");
    parentCommentId = commentRes.body.id;
  });

  it("should create a reply to a comment", async () => {
    const res = await request(app)
      .post(`/comment/${parentCommentId}/reply`)
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "Reply to comment");

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.content).toBe("Reply to comment");
    expect(res.body.parentId).toBe(parentCommentId);
    expect(res.body.postId).toBe(postId);
  });

  it("should create nested replies (reply to a reply)", async () => {
    const firstReplyRes = await request(app)
      .post(`/comment/${parentCommentId}/reply`)
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "First reply");
    const firstReplyId = firstReplyRes.body.id;

    const secondReplyRes = await request(app)
      .post(`/comment/${firstReplyId}/reply`)
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "Second level reply");

    expect(secondReplyRes.statusCode).toBe(201);
    expect(secondReplyRes.body.content).toBe("Second level reply");
    expect(secondReplyRes.body.parentId).toBe(firstReplyId);
  });

  it("should reject reply without text nor images", async () => {
    const res = await request(app)
      .post(`/comment/${parentCommentId}/reply`)
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "");

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Text or images are required");
  });

  it("should reject reply with whitespace-only text", async () => {
    const res = await request(app)
      .post(`/comment/${parentCommentId}/reply`)
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "   ");

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Text or images are required");
  });

  it("should create reply with images only", async () => {
    const res = await request(app)
      .post(`/comment/${parentCommentId}/reply`)
      .set("Authorization", `Bearer ${accessToken}`)
      .attach("images", Buffer.from(pngImageBase64, "base64"), "test.png");

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.images).toHaveLength(1);
  });

  it("should create reply with text and images", async () => {
    const res = await request(app)
      .post(`/comment/${parentCommentId}/reply`)
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "Reply with image!")
      .attach("images", Buffer.from(pngImageBase64, "base64"), "test.png");

    expect(res.statusCode).toBe(201);
    expect(res.body.content).toBe("Reply with image!");
    expect(res.body.images).toHaveLength(1);
  });

  it("should reject more than 4 images", async () => {
    const req = request(app)
      .post(`/comment/${parentCommentId}/reply`)
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
      .post(`/comment/${parentCommentId}/reply`)
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", longText);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Max 200 characters allowed");
  });

  it("should return 404 for non-existent parent comment", async () => {
    const res = await request(app)
      .post("/comment/non-existent-comment-id/reply")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "Reply to nothing");

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error", "Comment not found");
  });

  it("should return 401 without auth", async () => {
    const res = await request(app)
      .post(`/comment/${parentCommentId}/reply`)
      .field("text", "Reply without auth");

    expect(res.statusCode).toBe(401);
  });

  it("should handle internal server error", async () => {
    const commentService = (await import("../../services/commentService.js"))
      .default;
    const replyToCommentMock = vi
      .spyOn(commentService, "replyToComment")
      .mockRejectedValueOnce(new Error("fail"));

    const res = await request(app)
      .post(`/comment/${parentCommentId}/reply`)
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "Test reply");

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");

    replyToCommentMock.mockRestore();
  });
});

describe("Nested comment - thread hierarchy", () => {
  const userData = {
    email: "threaduser@example.com",
    username: "threaduser",
    password: "ThreadUser123",
  };

  let accessToken: string;
  let postId: string;
  let parentCommentId: string;

  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.post.deleteMany();
    await prisma.comment.deleteMany();

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
      .field("text", "Test post");
    postId = postRes.body.id;

    const commentRes = await request(app)
      .post(`/post/${postId}/reply`)
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "Parent comment");
    parentCommentId = commentRes.body.id;
  });

  it("should correctly link nested comment to post", async () => {
    const replyRes = await request(app)
      .post(`/comment/${parentCommentId}/reply`)
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "Nested reply");

    expect(replyRes.body.postId).toBe(postId);
  });

  it("should appear in thread with proper hierarchy", async () => {
    const replyRes = await request(app)
      .post(`/comment/${parentCommentId}/reply`)
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "Reply to parent");
    const replyId = replyRes.body.id;

    const threadRes = await request(app)
      .get(`/comment/${replyId}/thread`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(threadRes.statusCode).toBe(200);
    expect(threadRes.body.comment.id).toBe(replyId);
    expect(threadRes.body.parentComments).toHaveLength(1);
    expect(threadRes.body.parentComments[0].id).toBe(parentCommentId);
  });

  it("should show reply count in comments list", async () => {
    await request(app)
      .post(`/comment/${parentCommentId}/reply`)
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "Reply 1");

    await request(app)
      .post(`/comment/${parentCommentId}/reply`)
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "Reply 2");

    const commentsRes = await request(app)
      .get(`/post/${postId}/comments`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(commentsRes.statusCode).toBe(200);
    expect(commentsRes.body[0].commentCount).toBe(2);
  });
});
