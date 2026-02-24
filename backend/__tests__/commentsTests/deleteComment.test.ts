import createApp from "../../app.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { prisma } from "../../prisma/prismaClient.js";

const app = createApp({ enableRateLimit: false });

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

describe("DELETE /comment/:id", () => {
  const userData = {
    email: "deletecommentuser@example.com",
    username: "deletecommentuser",
    password: "DeleteComment123",
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
      .field("text", "Test post for comments");
    postId = postRes.body.id;

    const commentRes = await request(app)
      .post(`/post/${postId}/reply`)
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "Comment to be deleted");
    commentId = commentRes.body.id;
  });

  it("should delete comment successfully", async () => {
    const res = await request(app)
      .delete(`/comment/${commentId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Comment deleted successfully");
  });

  it("should return 404 for non-existent comment", async () => {
    const res = await request(app)
      .delete("/comment/non-existent-id")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error", "Comment not found");
  });

  it("should return 403 when user is not comment owner", async () => {
    await request(app).post("/auth/signup").send({
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
      .delete(`/comment/${commentId}`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("error", "Forbidden");
  });

  it("should return 401 without auth", async () => {
    const res = await request(app).delete(`/comment/${commentId}`);

    expect(res.statusCode).toBe(401);
  });

  it("should handle internal server error", async () => {
    const commentService = (await import("../../services/commentService.js"))
      .default;
    const deleteCommentMock = vi
      .spyOn(commentService, "deleteComment")
      .mockRejectedValueOnce(new Error("fail"));

    const res = await request(app)
      .delete(`/comment/${commentId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");

    deleteCommentMock.mockRestore();
  });
});
