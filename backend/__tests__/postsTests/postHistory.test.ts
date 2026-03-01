import createApp from "../../app.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { prisma } from "../../prisma/prismaClient.js";

const app = createApp({ enableRateLimit: false, enableCsrf: false });

describe("GET /post/:id/history", () => {
  const userData = {
    email: "historyuser@example.com",
    username: "historyuser",
    password: "HistoryUser123",
  };

  let accessToken: string;
  let postId: string;

  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.post.deleteMany();
    await prisma.postHistory.deleteMany();

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

  it("should return empty array for post with no edits", async () => {
    const res = await request(app)
      .get(`/post/${postId}/history`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("should return edit history after post is edited", async () => {
    await request(app)
      .put(`/post/${postId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ content: "Updated content" });

    const res = await request(app)
      .get(`/post/${postId}/history`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toHaveProperty("content", "Original content");
  });

  it("should return multiple history entries after multiple edits", async () => {
    await request(app)
      .put(`/post/${postId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ content: "First edit" });

    await request(app)
      .put(`/post/${postId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ content: "Second edit" });

    const res = await request(app)
      .get(`/post/${postId}/history`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("should return 404 for non-existent post", async () => {
    const res = await request(app)
      .get("/post/non-existent-id/history")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error", "Post not found");
  });

  it("should return 401 without auth", async () => {
    const res = await request(app).get(`/post/${postId}/history`);

    expect(res.statusCode).toBe(401);
  });

  it("should handle internal server error", async () => {
    const { postService } = await import("../../services/postService.js");
    const getHistoryMock = vi
      .spyOn(postService, "getEditHistory")
      .mockRejectedValueOnce(new Error("fail"));

    const res = await request(app)
      .get(`/post/${postId}/history`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");

    getHistoryMock.mockRestore();
  });
});
