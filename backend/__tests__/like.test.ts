import app from "../app.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { prisma } from "../prisma/prismaClient.js";

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

describe("POST /post/:id/like", () => {
  const userData = {
    email: "likeuser@example.com",
    username: "likeuser",
    password: "LikeUser123",
  };

  let accessToken: string;
  let postId: string;

  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.post.deleteMany();
    await prisma.postLike.deleteMany();

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
      .field("text", "Test post for likes");
    postId = postRes.body.id;
  });

  it("should like a post", async () => {
    const res = await request(app)
      .post(`/post/${postId}/like`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("likeCount", 1);
  });

  it("should unlike a post if already liked", async () => {
    await request(app)
      .post(`/post/${postId}/like`)
      .set("Authorization", `Bearer ${accessToken}`);

    const res = await request(app)
      .post(`/post/${postId}/like`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("likeCount", 0);
  });

  it("should return 404 for non-existent post", async () => {
    const res = await request(app)
      .post("/post/non-existent-id/like")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error", "Post not found");
  });

  it("should return 401 without auth", async () => {
    const res = await request(app).post(`/post/${postId}/like`);

    expect(res.statusCode).toBe(401);
  });

  it("should handle internal server error", async () => {
    const { postService } = await import("../services/postService.js");
    const likePostMock = vi
      .spyOn(postService, "likePost")
      .mockRejectedValueOnce(new Error("fail"));

    const res = await request(app)
      .post(`/post/${postId}/like`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");

    likePostMock.mockRestore();
  });
});

describe("POST /comment/:id/like", () => {
  const userData = {
    email: "commentlikeuser@example.com",
    username: "commentlikeuser",
    password: "CommentLike123",
  };

  let accessToken: string;
  let postId: string;
  let commentId: string;

  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.post.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.commentLike.deleteMany();

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
      .field("text", "Test post for comment likes");
    postId = postRes.body.id;

    const commentRes = await request(app)
      .post(`/post/${postId}/reply`)
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "Test comment for likes");
    commentId = commentRes.body.id;
  });

  it("should like a comment", async () => {
    const res = await request(app)
      .post(`/comment/${commentId}/like`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("likeCount", 1);
  });

  it("should unlike a comment if already liked", async () => {
    await request(app)
      .post(`/comment/${commentId}/like`)
      .set("Authorization", `Bearer ${accessToken}`);

    const res = await request(app)
      .post(`/comment/${commentId}/like`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("likeCount", 0);
  });

  it("should return 404 for non-existent comment", async () => {
    const res = await request(app)
      .post("/comment/non-existent-id/like")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error", "Comment not found");
  });

  it("should return 401 without auth", async () => {
    const res = await request(app).post(`/comment/${commentId}/like`);

    expect(res.statusCode).toBe(401);
  });

  it("should handle internal server error", async () => {
    const commentService = (await import("../services/commentService.js"))
      .default;
    const likeCommentMock = vi
      .spyOn(commentService, "likeComment")
      .mockRejectedValueOnce(new Error("fail"));

    const res = await request(app)
      .post(`/comment/${commentId}/like`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");

    likeCommentMock.mockRestore();
  });
});

describe("Post like - multiple users", () => {
  const user1 = {
    email: "user1@example.com",
    username: "user1",
    password: "User1Pass123",
  };
  const user2 = {
    email: "user2@example.com",
    username: "user2",
    password: "User2Pass123",
  };

  let user1Token: string;
  let user2Token: string;
  let postId: string;

  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.post.deleteMany();
    await prisma.postLike.deleteMany();

    await request(app)
      .post("/auth/signup")
      .send({ ...user1, confirmPassword: user1.password });
    const user1Login = await request(app).post("/auth/login").send({
      identifier: user1.email,
      password: user1.password,
    });
    user1Token = user1Login.body.accessToken;

    await request(app)
      .post("/auth/signup")
      .send({ ...user2, confirmPassword: user2.password });
    const user2Login = await request(app).post("/auth/login").send({
      identifier: user2.email,
      password: user2.password,
    });
    user2Token = user2Login.body.accessToken;

    const postRes = await request(app)
      .post("/post/new")
      .set("Authorization", `Bearer ${user1Token}`)
      .field("text", "Test post");
    postId = postRes.body.id;
  });

  it("should track likes from multiple users", async () => {
    const res1 = await request(app)
      .post(`/post/${postId}/like`)
      .set("Authorization", `Bearer ${user1Token}`);
    expect(res1.body.likeCount).toBe(1);

    const res2 = await request(app)
      .post(`/post/${postId}/like`)
      .set("Authorization", `Bearer ${user2Token}`);
    expect(res2.body.likeCount).toBe(2);

    const res3 = await request(app)
      .post(`/post/${postId}/like`)
      .set("Authorization", `Bearer ${user1Token}`);
    expect(res3.body.likeCount).toBe(1);

    const res4 = await request(app)
      .post(`/post/${postId}/like`)
      .set("Authorization", `Bearer ${user2Token}`);
    expect(res4.body.likeCount).toBe(0);
  });

  it("should show correct isLiked status in post details", async () => {
    const getPost = async (token: string, expectedLiked: boolean) => {
      const res = await request(app)
        .get(`/post/${postId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.body.isLiked).toBe(expectedLiked);
    };

    await request(app)
      .post(`/post/${postId}/like`)
      .set("Authorization", `Bearer ${user1Token}`);

    await getPost(user1Token, true);
    await getPost(user2Token, false);
  });
});

describe("Comment like - multiple users", () => {
  const user1 = {
    email: "cuser1@example.com",
    username: "cuser1",
    password: "Cuser1Pass123",
  };
  const user2 = {
    email: "cuser2@example.com",
    username: "cuser2",
    password: "Cuser2Pass123",
  };

  let user1Token: string;
  let user2Token: string;
  let postId: string;
  let commentId: string;

  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.post.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.commentLike.deleteMany();

    await request(app)
      .post("/auth/signup")
      .send({ ...user1, confirmPassword: user1.password });
    const user1Login = await request(app).post("/auth/login").send({
      identifier: user1.email,
      password: user1.password,
    });
    user1Token = user1Login.body.accessToken;

    await request(app)
      .post("/auth/signup")
      .send({ ...user2, confirmPassword: user2.password });
    const user2Login = await request(app).post("/auth/login").send({
      identifier: user2.email,
      password: user2.password,
    });
    user2Token = user2Login.body.accessToken;

    const postRes = await request(app)
      .post("/post/new")
      .set("Authorization", `Bearer ${user1Token}`)
      .field("text", "Test post");
    postId = postRes.body.id;

    const commentRes = await request(app)
      .post(`/post/${postId}/reply`)
      .set("Authorization", `Bearer ${user1Token}`)
      .field("text", "Test comment");
    commentId = commentRes.body.id;
  });

  it("should track likes from multiple users", async () => {
    const res1 = await request(app)
      .post(`/comment/${commentId}/like`)
      .set("Authorization", `Bearer ${user1Token}`);
    expect(res1.body.likeCount).toBe(1);

    const res2 = await request(app)
      .post(`/comment/${commentId}/like`)
      .set("Authorization", `Bearer ${user2Token}`);
    expect(res2.body.likeCount).toBe(2);

    const res3 = await request(app)
      .post(`/comment/${commentId}/like`)
      .set("Authorization", `Bearer ${user1Token}`);
    expect(res3.body.likeCount).toBe(1);

    const res4 = await request(app)
      .post(`/comment/${commentId}/like`)
      .set("Authorization", `Bearer ${user2Token}`);
    expect(res4.body.likeCount).toBe(0);
  });

  it("should show correct isLiked status in comments list", async () => {
    await request(app)
      .post(`/comment/${commentId}/like`)
      .set("Authorization", `Bearer ${user1Token}`);

    const res = await request(app)
      .get(`/post/${postId}/comments`)
      .set("Authorization", `Bearer ${user1Token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body[0].isLiked).toBe(true);

    const res2 = await request(app)
      .get(`/post/${postId}/comments`)
      .set("Authorization", `Bearer ${user2Token}`);

    expect(res2.statusCode).toBe(200);
    expect(res2.body[0].isLiked).toBe(false);
  });
});
