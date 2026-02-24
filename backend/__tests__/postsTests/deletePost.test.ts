import createApp from "../../app.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { prisma } from "../../prisma/prismaClient.js";

const app = createApp({ enableRateLimit: false, enableCsrf: false });

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

describe("DELETE /post/:id", () => {
  const userData = {
    email: "deleteuser@example.com",
    username: "deleteuser",
    password: "DeleteUser123",
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
      .field("text", "Post to be deleted");
    postId = postRes.body.id;
  });

  it("should delete post successfully", async () => {
    const res = await request(app)
      .delete(`/post/${postId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Post deleted successfully");
  });

  it("should return 404 for non-existent post", async () => {
    const res = await request(app)
      .delete("/post/non-existent-id")
      .set("Authorization", `Bearer ${accessToken}`);

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
      .delete(`/post/${postId}`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 401 without auth", async () => {
    const res = await request(app).delete(`/post/${postId}`);

    expect(res.statusCode).toBe(401);
  });

  it("should handle internal server error", async () => {
    const { postService } = await import("../../services/postService.js");
    const deletePostMock = vi
      .spyOn(postService, "deletePost")
      .mockRejectedValueOnce(new Error("fail"));

    const res = await request(app)
      .delete(`/post/${postId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");

    deletePostMock.mockRestore();
  });
});
