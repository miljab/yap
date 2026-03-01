import createApp from "../../app.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { prisma } from "../../prisma/prismaClient.js";

const app = createApp({ enableRateLimit: false, enableCsrf: false });

describe("GET /post/:id/likes", () => {
  const ownerData = {
    email: "postowner@example.com",
    username: "postowner",
    password: "PostOwner123",
  };
  const otherUserData = {
    email: "otheruser@example.com",
    username: "otheruser",
    password: "OtherUser123",
  };

  let ownerToken: string;
  let otherToken: string;
  let postId: string;

  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.post.deleteMany();
    await prisma.postLike.deleteMany();

    await request(app)
      .post("/auth/signup")
      .send({ ...ownerData, confirmPassword: ownerData.password });
    const ownerLogin = await request(app).post("/auth/login").send({
      identifier: ownerData.email,
      password: ownerData.password,
    });
    ownerToken = ownerLogin.body.accessToken;

    await request(app)
      .post("/auth/signup")
      .send({ ...otherUserData, confirmPassword: otherUserData.password });
    const otherLogin = await request(app).post("/auth/login").send({
      identifier: otherUserData.email,
      password: otherUserData.password,
    });
    otherToken = otherLogin.body.accessToken;

    const postRes = await request(app)
      .post("/post/new")
      .set("Authorization", `Bearer ${ownerToken}`)
      .field("text", "Test post");
    postId = postRes.body.id;
  });

  it("should return empty list when no likes exist", async () => {
    const res = await request(app)
      .get(`/post/${postId}/likes`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("users");
    expect(res.body.users).toEqual([]);
    expect(res.body).toHaveProperty("nextCursor", null);
  });

  it("should return likes when post is liked", async () => {
    await request(app)
      .post(`/post/${postId}/like`)
      .set("Authorization", `Bearer ${otherToken}`);

    const res = await request(app)
      .get(`/post/${postId}/likes`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.users).toHaveLength(1);
    expect(res.body.users[0]).toHaveProperty("username", otherUserData.username);
  });

  it("should return 403 when requester is not post owner", async () => {
    const res = await request(app)
      .get(`/post/${postId}/likes`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("error", "Forbidden");
  });

  it("should return 404 for non-existent post", async () => {
    const res = await request(app)
      .get("/post/non-existent-id/likes")
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error", "Post not found");
  });

  it("should return 401 without auth", async () => {
    const res = await request(app).get(`/post/${postId}/likes`);

    expect(res.statusCode).toBe(401);
  });

  it("should respect limit query param", async () => {
    const thirdUser = {
      email: "thirduser@example.com",
      username: "thirduser",
      password: "ThirdUser123",
    };
    const fourthUser = {
      email: "fourthuser@example.com",
      username: "fourthuser",
      password: "FourthUser123",
    };

    await request(app)
      .post("/auth/signup")
      .send({ ...thirdUser, confirmPassword: thirdUser.password });
    const thirdLogin = await request(app).post("/auth/login").send({
      identifier: thirdUser.email,
      password: thirdUser.password,
    });
    const thirdToken = thirdLogin.body.accessToken;

    await request(app)
      .post("/auth/signup")
      .send({ ...fourthUser, confirmPassword: fourthUser.password });
    const fourthLogin = await request(app).post("/auth/login").send({
      identifier: fourthUser.email,
      password: fourthUser.password,
    });
    const fourthToken = fourthLogin.body.accessToken;

    await request(app)
      .post(`/post/${postId}/like`)
      .set("Authorization", `Bearer ${thirdToken}`);

    await request(app)
      .post(`/post/${postId}/like`)
      .set("Authorization", `Bearer ${fourthToken}`);

    const res = await request(app)
      .get(`/post/${postId}/likes?limit=1`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.users).toHaveLength(1);
    expect(res.body.nextCursor).not.toBeNull();
  });

  it("should handle internal server error", async () => {
    const { postService } = await import("../../services/postService.js");
    const getLikesMock = vi
      .spyOn(postService, "getPostLikes")
      .mockRejectedValueOnce(new Error("fail"));

    const res = await request(app)
      .get(`/post/${postId}/likes`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");

    getLikesMock.mockRestore();
  });
});

describe("GET /comment/:id/likes", () => {
  const ownerData = {
    email: "commentowner@example.com",
    username: "commentowner",
    password: "CommentOwner123",
  };
  const otherUserData = {
    email: "commentother@example.com",
    username: "commentother",
    password: "CommentOther123",
  };

  let ownerToken: string;
  let otherToken: string;
  let postId: string;
  let commentId: string;

  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.post.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.commentLike.deleteMany();

    await request(app)
      .post("/auth/signup")
      .send({ ...ownerData, confirmPassword: ownerData.password });
    const ownerLogin = await request(app).post("/auth/login").send({
      identifier: ownerData.email,
      password: ownerData.password,
    });
    ownerToken = ownerLogin.body.accessToken;

    await request(app)
      .post("/auth/signup")
      .send({ ...otherUserData, confirmPassword: otherUserData.password });
    const otherLogin = await request(app).post("/auth/login").send({
      identifier: otherUserData.email,
      password: otherUserData.password,
    });
    otherToken = otherLogin.body.accessToken;

    const postRes = await request(app)
      .post("/post/new")
      .set("Authorization", `Bearer ${ownerToken}`)
      .field("text", "Test post");
    postId = postRes.body.id;

    const commentRes = await request(app)
      .post(`/post/${postId}/reply`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .field("text", "Test comment");
    commentId = commentRes.body.id;
  });

  it("should return empty list when no likes exist", async () => {
    const res = await request(app)
      .get(`/comment/${commentId}/likes`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("users");
    expect(res.body.users).toEqual([]);
    expect(res.body).toHaveProperty("nextCursor", null);
  });

  it("should return likes when comment is liked", async () => {
    await request(app)
      .post(`/comment/${commentId}/like`)
      .set("Authorization", `Bearer ${otherToken}`);

    const res = await request(app)
      .get(`/comment/${commentId}/likes`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.users).toHaveLength(1);
    expect(res.body.users[0]).toHaveProperty("username", otherUserData.username);
  });

  it("should return 403 when requester is not comment owner", async () => {
    const res = await request(app)
      .get(`/comment/${commentId}/likes`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("error", "Forbidden");
  });

  it("should return 404 for non-existent comment", async () => {
    const res = await request(app)
      .get("/comment/non-existent-id/likes")
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error", "Comment not found");
  });

  it("should return 401 without auth", async () => {
    const res = await request(app).get(`/comment/${commentId}/likes`);

    expect(res.statusCode).toBe(401);
  });

  it("should handle internal server error", async () => {
    const commentService = (await import("../../services/commentService.js"))
      .default;
    const getLikesMock = vi
      .spyOn(commentService, "getCommentLikes")
      .mockRejectedValueOnce(new Error("fail"));

    const res = await request(app)
      .get(`/comment/${commentId}/likes`)
      .set("Authorization", `Bearer ${ownerToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");

    getLikesMock.mockRestore();
  });
});
