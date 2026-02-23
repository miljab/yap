import app from "../../app.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { prisma } from "../../prisma/prismaClient.js";

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

describe("GET /post/:id/comments", () => {
  const userData = {
    email: "commentreader@example.com",
    username: "commentreader",
    password: "CommentReader123",
  };

  let accessToken: string;
  let postId: string;

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
      .field("text", "Test post for comments");
    postId = postRes.body.id;

    await request(app)
      .post(`/post/${postId}/reply`)
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "First comment");

    await request(app)
      .post(`/post/${postId}/reply`)
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "Second comment");
  });

  it("should return comments for a post", async () => {
    const res = await request(app)
      .get(`/post/${postId}/comments`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toHaveProperty("content", "Second comment");
    expect(res.body[0]).toHaveProperty("user");
    expect(res.body[0]).toHaveProperty("likeCount");
    expect(res.body[0]).toHaveProperty("commentCount");
    expect(res.body[0]).toHaveProperty("isLiked");
  });

  it("should return empty array when no comments exist", async () => {
    await prisma.comment.deleteMany();

    const res = await request(app)
      .get(`/post/${postId}/comments`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(0);
  });

  it("should return 404 for non-existent post", async () => {
    const res = await request(app)
      .get("/post/non-existent-post-id/comments")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 401 without auth", async () => {
    const res = await request(app).get(`/post/${postId}/comments`);

    expect(res.statusCode).toBe(401);
  });

  it("should handle internal server error", async () => {
    const commentService = (await import("../../services/commentService.js"))
      .default;
    const getCommentsMock = vi
      .spyOn(commentService, "getComments")
      .mockRejectedValueOnce(new Error("fail"));

    const res = await request(app)
      .get(`/post/${postId}/comments`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");

    getCommentsMock.mockRestore();
  });
});

describe("GET /comment/:id/thread", () => {
  const userData = {
    email: "threaduser@example.com",
    username: "threaduser",
    password: "ThreadUser123",
  };

  let accessToken: string;
  let postId: string;
  let commentId: string;

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
      .field("text", "Test post for thread");
    postId = postRes.body.id;

    const commentRes = await request(app)
      .post(`/post/${postId}/reply`)
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "Parent comment");
    commentId = commentRes.body.id;

    await request(app)
      .post(`/comment/${commentId}/reply`)
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "Reply to comment");
  });

  it("should return thread for a comment", async () => {
    const res = await request(app)
      .get(`/comment/${commentId}/thread`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("post");
    expect(res.body).toHaveProperty("comment");
    expect(res.body.comment.content).toBe("Parent comment");
    expect(res.body).toHaveProperty("parentComments");
    expect(res.body).toHaveProperty("replies");
    expect(res.body.replies).toHaveLength(1);
    expect(res.body.replies[0].content).toBe("Reply to comment");
  });

  it("should return 404 for non-existent comment", async () => {
    const res = await request(app)
      .get("/comment/non-existent-comment-id/thread")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error", "Comment not found");
  });

  it("should return 401 without auth", async () => {
    const res = await request(app).get(`/comment/${commentId}/thread`);

    expect(res.statusCode).toBe(401);
  });

  it("should handle internal server error", async () => {
    const commentService = (await import("../../services/commentService.js"))
      .default;
    const getThreadMock = vi
      .spyOn(commentService, "getThread")
      .mockRejectedValueOnce(new Error("fail"));

    const res = await request(app)
      .get(`/comment/${commentId}/thread`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");

    getThreadMock.mockRestore();
  });
});
