import { beforeEach, describe, vi, it, expect } from "vitest";
import { prisma } from "../../prisma/prismaClient.js";
import { googleCallback } from "../../passport/googlePassport.js";
import type { Profile } from "passport-google-oauth20";

describe("Google oAuth authentication", () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.account.deleteMany();
  });

  it("should create a new user and account if none exist", async () => {
    const mockDone = vi.fn();
    const mockProfile = {
      id: "some-google-id",
      emails: [{ value: "googleuser@example.com" }],
    };

    await googleCallback(
      "accessToken",
      "refreshToken",
      mockProfile as Profile,
      mockDone
    );

    const user = await prisma.user.findUnique({
      where: { email: "googleuser@example.com" },
    });
    expect(user).not.toBeNull();
    expect(mockDone).toHaveBeenCalledWith(
      null,
      expect.objectContaining({ email: "googleuser@example.com" })
    );
  });

  it("should return existing user if email is already linked to google", async () => {
    const user = await prisma.user.create({
      data: {
        email: "linked@example.com",
        password: null,
        account: {
          create: {
            provider: "GOOGLE",
            providerAccountId: "linked-google-id",
          },
        },
      },
    });

    const mockDone = vi.fn();
    const mockProfile = {
      id: "linked-google-id",
      emails: [{ value: "linked@example.com" }],
    };

    await googleCallback(
      "accessToken",
      "refreshToken",
      mockProfile as Profile,
      mockDone
    );

    expect(mockDone).toHaveBeenCalledWith(
      null,
      expect.objectContaining({ email: "linked@example.com" })
    );
  });

  it("should return error if email is linked to another provider", async () => {
    await prisma.user.create({
      data: {
        email: "githubuser@example.com",
        password: null,
        account: {
          create: {
            provider: "GITHUB",
            providerAccountId: "some-github-id",
          },
        },
      },
    });

    const mockDone = vi.fn();
    const mockProfile = {
      id: "some-github-id",
      emails: [{ value: "githubuser@example.com" }],
    };

    await googleCallback(
      "accessToken",
      "refreshToken",
      mockProfile as Profile,
      mockDone
    );

    expect(mockDone).toHaveBeenCalledWith(expect.any(Error));
    expect(mockDone.mock.calls[0]?.[0]?.message).toMatch(
      /Email already linked to another provider/
    );
  });

  it("should return error if user exists but is not linked to any provider", async () => {
    await prisma.user.create({
      data: {
        email: "noprovider@example.com",
        password: "SecurePassword123",
        username: "NonProvider",
      },
    });

    const mockDone = vi.fn();
    const mockProfile = {
      id: "google-id-noprovider",
      emails: [{ value: "noprovider@example.com" }],
    };

    await googleCallback(
      "accessToken",
      "refreshToken",
      mockProfile as Profile,
      mockDone
    );

    expect(mockDone).toHaveBeenCalledWith(expect.any(Error));
    expect(mockDone.mock.calls[0]?.[0]?.message).toMatch(
      /Email not linked to any provider/
    );
  });

  it("should return user if found by providerAccountId when email is not provided", async () => {
    const user = await prisma.user.create({
      data: {
        email: "customemail@example.com",
        password: null,
        account: {
          create: {
            provider: "GOOGLE",
            providerAccountId: "some-google-id",
          },
        },
      },
    });

    const mockDone = vi.fn();
    const mockProfile = {
      id: "some-google-id",
      emails: [{}],
    };

    await googleCallback(
      "accessToken",
      "refreshToken",
      mockProfile as Profile,
      mockDone
    );

    expect(mockDone).toHaveBeenCalledWith(
      null,
      expect.objectContaining({ email: "customemail@example.com" })
    );
  });
});
