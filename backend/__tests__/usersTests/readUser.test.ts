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

describe("GET /profile/:username", () => {
  const userData = {
    email: "profileuser@example.com",
    username: "profileuser",
    password: "ProfileUser123",
  };

  let accessToken: string;

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
  });

  it("should return user profile by username", async () => {
    const res = await request(app)
      .get(`/profile/${userData.username}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body.username).toBe(userData.username);
    expect(res.body).toHaveProperty("followersCount");
    expect(res.body).toHaveProperty("followingCount");
    expect(res.body).toHaveProperty("isFollowed");
  });

  it("should return 404 for non-existent user", async () => {
    const res = await request(app)
      .get("/profile/non-existent-user")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error", "User not found");
  });

  it("should return 401 without auth", async () => {
    const res = await request(app).get(`/profile/${userData.username}`);

    expect(res.statusCode).toBe(401);
  });

  it("should handle internal server error", async () => {
    const { userService } = await import("../../services/userService.js");
    const getUserProfileMock = vi
      .spyOn(userService, "getUserProfile")
      .mockRejectedValueOnce(new Error("fail"));

    const res = await request(app)
      .get(`/profile/${userData.username}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");

    getUserProfileMock.mockRestore();
  });
});

describe("GET /users/:userId/posts", () => {
  const userData = {
    email: "userpostreader@example.com",
    username: "userpostreader",
    password: "UserPostReader123",
  };

  let accessToken: string;
  let userId: string;

  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.post.deleteMany();

    await request(app)
      .post("/auth/signup")
      .send({ ...userData, confirmPassword: userData.password });

    const loginRes = await request(app).post("/auth/login").send({
      identifier: userData.email,
      password: userData.password,
    });
    accessToken = loginRes.body.accessToken;
    userId = loginRes.body.user.id;

    await request(app)
      .post("/post/new")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "First post");

    await request(app)
      .post("/post/new")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "Second post");
  });

  it("should return posts for a user", async () => {
    const res = await request(app)
      .get(`/users/${userId}/posts`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("posts");
    expect(res.body.posts).toHaveLength(2);
  });

  it("should return empty posts array when user has no posts", async () => {
    await prisma.post.deleteMany();

    const res = await request(app)
      .get(`/users/${userId}/posts`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.posts).toHaveLength(0);
  });

  it("should respect limit query param", async () => {
    const res = await request(app)
      .get(`/users/${userId}/posts?limit=1`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.posts).toHaveLength(1);
  });

  it("should return 401 without auth", async () => {
    const res = await request(app).get(`/users/${userId}/posts`);

    expect(res.statusCode).toBe(401);
  });
});

describe("GET /users/:userId/comments", () => {
  const userData = {
    email: "usercommentreader@example.com",
    username: "usercommentreader",
    password: "UserCommentReader123",
  };

  let accessToken: string;
  let postId: string;
  let userId: string;

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
    userId = loginRes.body.user.id;

    const postRes = await request(app)
      .post("/post/new")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "Test post");
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

  it("should return comments for a user", async () => {
    const res = await request(app)
      .get(`/users/${userId}/comments`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("comments");
    expect(res.body.comments).toHaveLength(2);
  });

  it("should return empty comments array when user has no comments", async () => {
    await prisma.comment.deleteMany();

    const res = await request(app)
      .get(`/users/${userId}/comments`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.comments).toHaveLength(0);
  });

  it("should return 401 without auth", async () => {
    const res = await request(app).get(`/users/${userId}/comments`);

    expect(res.statusCode).toBe(401);
  });
});

describe("GET /users/:userId/following", () => {
  const userData = {
    email: "followinguser1@example.com",
    username: "followinguser1",
    password: "FollowingUser123",
  };

  const otherUserData = {
    email: "followinguser2@example.com",
    username: "followinguser2",
    password: "FollowingUser2123",
  };

  let accessToken: string;
  let otherUserId: string;
  let currentUserId: string;

  beforeEach(async () => {
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();

    await request(app)
      .post("/auth/signup")
      .send({ ...userData, confirmPassword: userData.password });

    const loginRes = await request(app).post("/auth/login").send({
      identifier: userData.email,
      password: userData.password,
    });
    accessToken = loginRes.body.accessToken;
    currentUserId = loginRes.body.user.id;

    await request(app)
      .post("/auth/signup")
      .send({ ...otherUserData, confirmPassword: otherUserData.password });

    const otherLoginRes = await request(app).post("/auth/login").send({
      identifier: otherUserData.email,
      password: otherUserData.password,
    });
    otherUserId = otherLoginRes.body.user.id;

    await request(app)
      .put(`/users/${otherUserId}/follow`)
      .set("Authorization", `Bearer ${accessToken}`);
  });

  it("should return users that the user is following", async () => {
    const res = await request(app)
      .get(`/users/${currentUserId}/following`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("users");
    expect(res.body.users).toHaveLength(1);
  });

  it("should return 401 without auth", async () => {
    const res = await request(app).get(`/users/${currentUserId}/following`);

    expect(res.statusCode).toBe(401);
  });
});

describe("GET /users/:userId/following - no following", () => {
  const userData = {
    email: "nofollowing@example.com",
    username: "nofollowing",
    password: "Nofollowing123",
  };

  let accessToken: string;
  let userId: string;

  beforeEach(async () => {
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();

    await request(app)
      .post("/auth/signup")
      .send({ ...userData, confirmPassword: userData.password });

    const loginRes = await request(app).post("/auth/login").send({
      identifier: userData.email,
      password: userData.password,
    });
    accessToken = loginRes.body.accessToken;
    userId = loginRes.body.user.id;
  });

  it("should return empty array when not following anyone", async () => {
    const res = await request(app)
      .get(`/users/${userId}/following`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.users).toHaveLength(0);
  });
});

describe("GET /users/:userId/followers", () => {
  const userData = {
    email: "followeruser1@example.com",
    username: "followeruser1",
    password: "FollowerUser123",
  };

  const followerData = {
    email: "followeruser2@example.com",
    username: "followeruser2",
    password: "FollowerUser2123",
  };

  let accessToken: string;
  let userId: string;

  beforeEach(async () => {
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();

    await request(app)
      .post("/auth/signup")
      .send({ ...userData, confirmPassword: userData.password });

    const loginRes = await request(app).post("/auth/login").send({
      identifier: userData.email,
      password: userData.password,
    });
    accessToken = loginRes.body.accessToken;
    userId = loginRes.body.user.id;

    await request(app)
      .post("/auth/signup")
      .send({ ...followerData, confirmPassword: followerData.password });

    const followerLoginRes = await request(app).post("/auth/login").send({
      identifier: followerData.email,
      password: followerData.password,
    });
    const followerToken = followerLoginRes.body.accessToken;

    await request(app)
      .put(`/users/${userId}/follow`)
      .set("Authorization", `Bearer ${followerToken}`);
  });

  it("should return followers of a user", async () => {
    const res = await request(app)
      .get(`/users/${userId}/followers`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("users");
    expect(res.body.users).toHaveLength(1);
  });

  it("should return 401 without auth", async () => {
    const res = await request(app).get(`/users/${userId}/followers`);

    expect(res.statusCode).toBe(401);
  });
});

describe("GET /users/:userId/followers - no followers", () => {
  const userData = {
    email: "nofollowers@example.com",
    username: "nofollowers",
    password: "Nofollowers123",
  };

  let accessToken: string;
  let userId: string;

  beforeEach(async () => {
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();

    await request(app)
      .post("/auth/signup")
      .send({ ...userData, confirmPassword: userData.password });

    const loginRes = await request(app).post("/auth/login").send({
      identifier: userData.email,
      password: userData.password,
    });
    accessToken = loginRes.body.accessToken;
    userId = loginRes.body.user.id;
  });

  it("should return empty array when user has no followers", async () => {
    const res = await request(app)
      .get(`/users/${userId}/followers`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.users).toHaveLength(0);
  });
});
