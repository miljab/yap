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

describe("GET /post/:id", () => {
  const userData = {
    email: "readuser@example.com",
    username: "readuser",
    password: "ReadUser123",
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
      .field("text", "Test post for reading");
    postId = postRes.body.id;
  });

  it("should return post by ID", async () => {
    const res = await request(app)
      .get(`/post/${postId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id", postId);
    expect(res.body.content).toBe("Test post for reading");
  });

  it("should return 404 for non-existent post", async () => {
    const res = await request(app)
      .get("/post/non-existent-id")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error", "Post not found");
  });

  it("should return 401 without auth", async () => {
    const res = await request(app).get(`/post/${postId}`);

    expect(res.statusCode).toBe(401);
  });

  it("should handle internal server error", async () => {
    const { postService } = await import("../../services/postService.js");
    const getPostMock = vi
      .spyOn(postService, "getPostById")
      .mockRejectedValueOnce(new Error("fail"));

    const res = await request(app)
      .get(`/post/${postId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");

    getPostMock.mockRestore();
  });
});

describe("GET /feed", () => {
  const userData = {
    email: "feeduser@example.com",
    username: "feeduser",
    password: "FeedUser123",
  };

  let accessToken: string;

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

    await request(app)
      .post("/post/new")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "First post");

    await request(app)
      .post("/post/new")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "Second post");
  });

  it("should return home feed with posts", async () => {
    const res = await request(app)
      .get("/feed")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("posts");
    expect(res.body.posts).toHaveLength(2);
    expect(res.body).toHaveProperty("nextCursor");
  });

  it("should return empty posts array when no posts exist", async () => {
    await prisma.post.deleteMany();

    const res = await request(app)
      .get("/feed")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.posts).toHaveLength(0);
  });

  it("should return 401 without auth", async () => {
    const res = await request(app).get("/feed");

    expect(res.statusCode).toBe(401);
  });

  it("should respect limit query param", async () => {
    const res = await request(app)
      .get("/feed?limit=1")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.posts).toHaveLength(1);
  });
});

describe("GET /feed/following", () => {
  const userData = {
    email: "followinguser@example.com",
    username: "followinguser",
    password: "FollowingUser123",
  };

  const followerData = {
    email: "follower@example.com",
    username: "follower",
    password: "Follower123",
  };

  let accessToken: string;
  let followerToken: string;

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

    await request(app)
      .post("/auth/signup")
      .send({ ...followerData, confirmPassword: followerData.password });

    const followerLoginRes = await request(app).post("/auth/login").send({
      identifier: followerData.email,
      password: followerData.password,
    });
    followerToken = followerLoginRes.body.accessToken;

    await request(app)
      .post("/post/new")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "Post from followed user");
  });

  it("should return posts from followed users", async () => {
    await request(app)
      .put(`/users/${followerData.username}/follow`)
      .set("Authorization", `Bearer ${followerToken}`);

    const res = await request(app)
      .get("/feed/following")
      .set("Authorization", `Bearer ${followerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("posts");
  });

  it("should return empty feed when not following anyone", async () => {
    const res = await request(app)
      .get("/feed/following")
      .set("Authorization", `Bearer ${followerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.posts).toHaveLength(0);
  });

  it("should return 401 without auth", async () => {
    const res = await request(app).get("/feed/following");

    expect(res.statusCode).toBe(401);
  });
});
