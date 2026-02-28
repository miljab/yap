import { useLike } from "@/hooks/useLike";
import { describe, vi, beforeEach, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { toast } from "sonner";
import type { Like } from "@/types/post";
import type { User } from "@/types/user";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";

vi.mock("@/hooks/useAxiosPrivate", () => ({
  default: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

const mockUser: User = {
  id: "user-1",
  username: "testuser",
  createdAt: new Date(),
  avatarUrl: "",
  bio: undefined,
  email: undefined,
  followersCount: 0,
  followingCount: 0,
  isFollowed: false,
};

const createMockLike = (overrides: Partial<Like> = {}): Like => ({
  id: "like-1",
  createdAt: new Date(),
  user: mockUser,
  ...overrides,
});

const createMockAxiosPrivate = () => ({
  post: vi.fn(),
});

describe("useLike", () => {
  let mockAxiosPrivate: ReturnType<typeof createMockAxiosPrivate>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockAxiosPrivate = createMockAxiosPrivate();
    vi.mocked(useAxiosPrivate).mockReturnValue(
      mockAxiosPrivate as unknown as ReturnType<typeof useAxiosPrivate>,
    );
  });

  const initialProps = {
    itemId: "post-123",
    itemType: "post" as const,
    initialIsLiked: false,
    initialLikeCount: 5,
    initialLikedBy: [createMockLike()],
  };

  it("initializes with correct initial values", () => {
    const { result } = renderHook(() => useLike(initialProps));

    expect(result.current.isLiked).toBe(false);
    expect(result.current.likeCount).toBe(5);
    expect(result.current.isLiking).toBe(false);
  });

  it("optimistically likes a post when not already liked", async () => {
    mockAxiosPrivate.post.mockResolvedValueOnce({ data: { likeCount: 6 } });

    const { result } = renderHook(() => useLike(initialProps));

    await act(async () => {
      await result.current.handleLike();
    });

    expect(result.current.isLiked).toBe(true);
    expect(result.current.likeCount).toBe(6);
  });

  it("optimistically unlikes a post when already liked", async () => {
    const likedProps = {
      ...initialProps,
      initialIsLiked: true,
      initialLikeCount: 5,
    };
    mockAxiosPrivate.post.mockResolvedValueOnce({ data: { likeCount: 4 } });

    const { result } = renderHook(() => useLike(likedProps));

    await act(async () => {
      await result.current.handleLike();
    });

    expect(result.current.isLiked).toBe(false);
    expect(result.current.likeCount).toBe(4);
  });

  it("prevents double-clicking while request is in progress", async () => {
    mockAxiosPrivate.post.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: { likeCount: 6 } }), 10),
        ),
    );

    const { result } = renderHook(() => useLike(initialProps));

    act(() => {
      result.current.handleLike();
    });

    expect(result.current.isLiking).toBe(true);

    act(() => {
      result.current.handleLike();
    });

    expect(mockAxiosPrivate.post).toHaveBeenCalledTimes(1);
  });

  it("reverts state on API error when liking", async () => {
    mockAxiosPrivate.post.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useLike(initialProps));

    await act(async () => {
      await result.current.handleLike();
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Failed to like post. Please try again.",
    );
    expect(result.current.isLiked).toBe(false);
    expect(result.current.likeCount).toBe(5);
  });

  it("reverts state on API error when unliking", async () => {
    const likedProps = { ...initialProps, initialIsLiked: true };
    mockAxiosPrivate.post.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useLike(likedProps));

    await act(async () => {
      await result.current.handleLike();
    });

    expect(toast.error).toHaveBeenCalledWith(
      "Failed to dislike post. Please try again.",
    );
    expect(result.current.isLiked).toBe(true);
    expect(result.current.likeCount).toBe(5);
  });

  it("makes API call with correct endpoint for post", async () => {
    mockAxiosPrivate.post.mockResolvedValueOnce({ data: { likeCount: 6 } });

    const { result } = renderHook(() => useLike(initialProps));

    await act(async () => {
      await result.current.handleLike();
    });

    expect(mockAxiosPrivate.post).toHaveBeenCalledWith("/post/post-123/like");
  });

  it("makes API call with correct endpoint for comment", async () => {
    const commentProps = { ...initialProps, itemType: "comment" as const };
    mockAxiosPrivate.post.mockResolvedValueOnce({ data: { likeCount: 6 } });

    const { result } = renderHook(() => useLike(commentProps));

    await act(async () => {
      await result.current.handleLike();
    });

    expect(mockAxiosPrivate.post).toHaveBeenCalledWith(
      "/comment/post-123/like",
    );
  });

  it("syncs state when props change", async () => {
    const { result, rerender } = renderHook(
      ({ itemId, initialIsLiked, initialLikeCount, initialLikedBy }) =>
        useLike({
          itemId,
          itemType: "post",
          initialIsLiked,
          initialLikeCount,
          initialLikedBy,
        }),
      {
        initialProps: {
          itemId: "post-1",
          initialIsLiked: false,
          initialLikeCount: 5,
          initialLikedBy: [] as Like[],
        },
      },
    );

    expect(result.current.isLiked).toBe(false);
    expect(result.current.likeCount).toBe(5);

    rerender({
      itemId: "post-2",
      initialIsLiked: true,
      initialLikeCount: 10,
      initialLikedBy: [createMockLike()],
    });

    expect(result.current.isLiked).toBe(true);
    expect(result.current.likeCount).toBe(10);
  });
});
