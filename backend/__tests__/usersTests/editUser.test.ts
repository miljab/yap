import createApp from "../../app.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { prisma } from "../../prisma/prismaClient.js";

const app = createApp({ enableRateLimit: false, enableCsrf: false });

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

vi.mock("../../config/cloudinary.js", () => ({
  default: {
    uploader: {
      upload: vi.fn().mockResolvedValue({
        secure_url: "https://fake-cloudinary.com/avatar.jpg",
        public_id: "fake-avatar-public-id",
      }),
    },
  },
}));

describe("PUT /profile", () => {
  const userData = {
    email: "profileedituser@example.com",
    username: "profileedituser",
    password: "ProfileEditUser123",
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
  });

  it("should update user bio", async () => {
    const res = await request(app)
      .put("/profile")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("bio", "This is my new bio");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("bio", "This is my new bio");
  });

  it("should update user avatar", async () => {
    const res = await request(app)
      .put("/profile")
      .set("Authorization", `Bearer ${accessToken}`)
      .attach("avatar", Buffer.from(pngImageBase64, "base64"), "avatar.png");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("avatarUrl");
  });

  it("should update both bio and avatar", async () => {
    const res = await request(app)
      .put("/profile")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("bio", "New bio with avatar")
      .attach("avatar", Buffer.from(pngImageBase64, "base64"), "avatar.png");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("bio", "New bio with avatar");
    expect(res.body).toHaveProperty("avatarUrl");
  });

  it("should allow empty bio update", async () => {
    await prisma.user.update({
      where: { username: userData.username },
      data: { bio: "Old bio" },
    });

    const res = await request(app)
      .put("/profile")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("bio", "");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("bio", "");
  });

  it("should return 401 without auth", async () => {
    const res = await request(app)
      .put("/profile")
      .field("bio", "New bio");

    expect(res.statusCode).toBe(401);
  });

  it("should handle internal server error", async () => {
    const { userService } = await import("../../services/userService.js");
    const updateProfileMock = vi
      .spyOn(userService, "updateProfile")
      .mockRejectedValueOnce(new Error("fail"));

    const res = await request(app)
      .put("/profile")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("bio", "New bio");

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");

    updateProfileMock.mockRestore();
  });
});

describe("PUT /users/:userId/follow", () => {
  const userData = {
    email: "followuser1@example.com",
    username: "followuser1",
    password: "FollowUser123",
  };

  const otherUserData = {
    email: "followuser2@example.com",
    username: "followuser2",
    password: "FollowUser2123",
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
  });

  it("should follow a user", async () => {
    const res = await request(app)
      .put(`/users/${otherUserId}/follow`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("isFollowed", true);
  });

  it("should unfollow a user", async () => {
    await request(app)
      .put(`/users/${otherUserId}/follow`)
      .set("Authorization", `Bearer ${accessToken}`);

    const res = await request(app)
      .put(`/users/${otherUserId}/follow`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("isFollowed", false);
  });

  it("should return 400 when trying to follow yourself", async () => {
    const res = await request(app)
      .put(`/users/${currentUserId}/follow`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Cannot follow yourself");
  });

  it("should return 401 without auth", async () => {
    const res = await request(app).put(`/users/${otherUserId}/follow`);

    expect(res.statusCode).toBe(401);
  });

  it("should handle internal server error", async () => {
    const { userService } = await import("../../services/userService.js");
    const followProfileMock = vi
      .spyOn(userService, "followProfile")
      .mockRejectedValueOnce(new Error("fail"));

    const res = await request(app)
      .put(`/users/${otherUserId}/follow`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");

    followProfileMock.mockRestore();
  });
});
