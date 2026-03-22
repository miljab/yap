import createApp from "../../app.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { prisma } from "../../prisma/prismaClient.js";

const app = createApp({ enableRateLimit: false, enableCsrf: false });

describe("GET /search/users", () => {
  let accessToken: string;

  beforeEach(async () => {
    await prisma.user.deleteMany();

    await request(app)
      .post("/auth/signup")
      .send({
        email: "searchtest@example.com",
        username: "searchtest",
        password: "SearchTest123",
        confirmPassword: "SearchTest123",
      });

    const loginRes = await request(app).post("/auth/login").send({
      identifier: "searchtest@example.com",
      password: "SearchTest123",
    });
    accessToken = loginRes.body.accessToken;

    await request(app)
      .post("/auth/signup")
      .send({
        email: "johndoe@example.com",
        username: "johndoe",
        password: "JohnDoe123",
        confirmPassword: "JohnDoe123",
      });

    await request(app)
      .post("/auth/signup")
      .send({
        email: "johnsmith@example.com",
        username: "johnsmith",
        password: "JohnSmith123",
        confirmPassword: "JohnSmith123",
      });

    await request(app)
      .post("/auth/signup")
      .send({
        email: "janedoe@example.com",
        username: "janedoe",
        password: "JaneDoe123",
        confirmPassword: "JaneDoe123",
      });
  });

  it("should return users matching the search query", async () => {
    const res = await request(app)
      .get("/search/users?q=john")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("users");
    expect(res.body.users).toHaveLength(2);
    expect(res.body.users[0].username).toContain("john");
  });

  it("should return single user matching exact query", async () => {
    const res = await request(app)
      .get("/search/users?q=johndoe")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("users");
    expect(res.body.users).toHaveLength(1);
    expect(res.body.users[0].username).toBe("johndoe");
  });

  it("should return empty users array when no matches found", async () => {
    const res = await request(app)
      .get("/search/users?q=nonexistentuser")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("users");
    expect(res.body.users).toHaveLength(0);
  });

  it("should return 400 when query is missing", async () => {
    const res = await request(app)
      .get("/search/users")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Search query is required");
  });

  it("should return 400 when query is empty", async () => {
    const res = await request(app)
      .get("/search/users?q=")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Search query is required");
  });

  it("should return 400 when query is only whitespace", async () => {
    const res = await request(app)
      .get("/search/users?q=   ")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Search query is required");
  });

  it("should return 401 without auth", async () => {
    const res = await request(app).get("/search/users?q=john");

    expect(res.statusCode).toBe(401);
  });

  it("should respect limit query param", async () => {
    const res = await request(app)
      .get("/search/users?q=john&limit=1")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("users");
    expect(res.body.users).toHaveLength(1);
  });

  it("should return users with nextCursor when limit is applied", async () => {
    const res = await request(app)
      .get("/search/users?q=john&limit=1")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("users");
    expect(res.body).toHaveProperty("nextCursor");
  });

  it("should handle pagination with cursor", async () => {
    const firstRes = await request(app)
      .get("/search/users?q=john&limit=1")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(firstRes.statusCode).toBe(200);
    const cursor = firstRes.body.nextCursor;

    if (cursor) {
      const secondRes = await request(app)
        .get(`/search/users?q=john&limit=1&cursor=${cursor}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(secondRes.statusCode).toBe(200);
      expect(secondRes.body.users).toHaveLength(1);
    }
  });

  it("should handle internal server error", async () => {
    const { userService } = await import("../../services/userService.js");
    const searchUsersMock = vi
      .spyOn(userService, "searchUsers")
      .mockRejectedValueOnce(new Error("fail"));

    const res = await request(app)
      .get("/search/users?q=john")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");

    searchUsersMock.mockRestore();
  });
});
