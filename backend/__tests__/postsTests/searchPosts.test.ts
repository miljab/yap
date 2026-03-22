import createApp from "../../app.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { prisma } from "../../prisma/prismaClient.js";

const app = createApp({ enableRateLimit: false, enableCsrf: false });

describe("GET /search/posts", () => {
  const userData = {
    email: "searchuser@example.com",
    username: "searchuser",
    password: "SearchUser123",
  };

  let accessToken: string;

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

    await request(app)
      .post("/post/new")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "Hello world post");

    await request(app)
      .post("/post/new")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "Another interesting post about TypeScript");

    await request(app)
      .post("/post/new")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "JavaScript is great");
  });

  it("should return posts matching the search query", async () => {
    const res = await request(app)
      .get("/search/posts?q=world")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("posts");
    expect(res.body.posts).toHaveLength(1);
    expect(res.body.posts[0].content).toContain("Hello world");
  });

  it("should return posts matching TypeScript query", async () => {
    const res = await request(app)
      .get("/search/posts?q=TypeScript")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("posts");
    expect(res.body.posts).toHaveLength(1);
    expect(res.body.posts[0].content).toContain("TypeScript");
  });

  it("should return 400 when query is missing", async () => {
    const res = await request(app)
      .get("/search/posts")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Search query is required");
  });

  it("should return 400 when query is empty", async () => {
    const res = await request(app)
      .get("/search/posts?q=")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Search query is required");
  });

  it("should return 400 when query is only whitespace", async () => {
    const res = await request(app)
      .get("/search/posts?q=   ")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Search query is required");
  });

  it("should return empty posts array when no matches found", async () => {
    const res = await request(app)
      .get("/search/posts?q=nonexistentterm")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("posts");
    expect(res.body.posts).toHaveLength(0);
  });

  it("should return 401 without auth", async () => {
    const res = await request(app).get("/search/posts?q=hello");

    expect(res.statusCode).toBe(401);
  });

  it("should respect limit query param", async () => {
    const res = await request(app)
      .get("/search/posts?q=post&limit=1")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("posts");
    expect(res.body.posts).toHaveLength(1);
  });

  it("should return posts with nextCursor when limit is applied", async () => {
    const res = await request(app)
      .get("/search/posts?q=post&limit=2")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("posts");
    expect(res.body).toHaveProperty("nextCursor");
  });

  it("should return 400 for whitespace-only query", async () => {
    const res = await request(app)
      .get("/search/posts?q=   ")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Search query is required");
  });

  it("should find posts containing text with multiple words", async () => {
    await request(app)
      .post("/post/new")
      .set("Authorization", `Bearer ${accessToken}`)
      .field("text", "Unique search pattern xyz123 post");

    const res = await request(app)
      .get("/search/posts?q=Unique search pattern")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.posts).toHaveLength(1);
    expect(res.body.posts[0].content).toContain("Unique search pattern");
  });

  it("should match partial words within text", async () => {
    const res = await request(app)
      .get("/search/posts?q=interesting")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.posts).toHaveLength(1);
    expect(res.body.posts[0].content).toContain("interesting");
  });

  it("should handle pagination with cursor", async () => {
    const firstRes = await request(app)
      .get("/search/posts?q=post&limit=1")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(firstRes.statusCode).toBe(200);
    const cursor = firstRes.body.nextCursor;

    if (cursor) {
      const secondRes = await request(app)
        .get(`/search/posts?q=post&limit=1&cursor=${cursor}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(secondRes.statusCode).toBe(200);
      expect(secondRes.body.posts).toHaveLength(1);
    }
  });

  it("should handle internal server error", async () => {
    const { postService } = await import("../../services/postService.js");
    const searchPostsMock = vi
      .spyOn(postService, "searchPosts")
      .mockRejectedValueOnce(new Error("fail"));

    const res = await request(app)
      .get("/search/posts?q=hello")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");

    searchPostsMock.mockRestore();
  });
});
