import { useLike } from "@/hooks/useLike";
import { describe, vi, beforeEach, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { toast } from "sonner";
import * as axiosModule from "@/api/axios";

vi.mock("@/api/axios", () => ({
  axiosPrivate: {
    post: vi.fn(),
  },
  setAccessToken: vi.fn(),
  setRefreshCallback: vi.fn(),
  fetchCsrfToken: vi.fn(),
  default: { get: vi.fn() },
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe("useLike", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const initialProps = {
    itemId: "post-123",
    itemType: "post" as const,
    initialIsLiked: false,
    initialLikeCount: 5,
  };

  it("initializes with correct initial values", () => {
    const { result } = renderHook(() => useLike(initialProps));

    expect(result.current.isLiked).toBe(false);
    expect(result.current.likeCount).toBe(5);
    expect(result.current.isLiking).toBe(false);
  });

  it("optimistically likes a post when not already liked", async () => {
    vi.mocked(axiosModule.axiosPrivate.post).mockResolvedValueOnce({ data: { likeCount: 6 } });

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
    vi.mocked(axiosModule.axiosPrivate.post).mockResolvedValueOnce({ data: { likeCount: 4 } });

    const { result } = renderHook(() => useLike(likedProps));

    await act(async () => {
      await result.current.handleLike();
    });

    expect(result.current.isLiked).toBe(false);
    expect(result.current.likeCount).toBe(4);
  });

  it("prevents double-clicking while request is in progress", async () => {
    vi.mocked(axiosModule.axiosPrivate.post).mockImplementation(
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

    expect(axiosModule.axiosPrivate.post).toHaveBeenCalledTimes(1);
  });

  it("reverts state on API error when liking", async () => {
    vi.mocked(axiosModule.axiosPrivate.post).mockRejectedValueOnce(new Error("Network error"));

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
    vi.mocked(axiosModule.axiosPrivate.post).mockRejectedValueOnce(new Error("Network error"));

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
    vi.mocked(axiosModule.axiosPrivate.post).mockResolvedValueOnce({ data: { likeCount: 6 } });

    const { result } = renderHook(() => useLike(initialProps));

    await act(async () => {
      await result.current.handleLike();
    });

    expect(axiosModule.axiosPrivate.post).toHaveBeenCalledWith("/post/post-123/like");
  });

  it("makes API call with correct endpoint for comment", async () => {
    const commentProps = { ...initialProps, itemType: "comment" as const };
    vi.mocked(axiosModule.axiosPrivate.post).mockResolvedValueOnce({ data: { likeCount: 6 } });

    const { result } = renderHook(() => useLike(commentProps));

    await act(async () => {
      await result.current.handleLike();
    });

    expect(axiosModule.axiosPrivate.post).toHaveBeenCalledWith(
      "/comment/post-123/like",
    );
  });

  it("syncs state when props change", async () => {
    const { result, rerender } = renderHook(
      ({ itemId, initialIsLiked, initialLikeCount }) =>
        useLike({
          itemId,
          itemType: "post",
          initialIsLiked,
          initialLikeCount,
        }),
      {
        initialProps: {
          itemId: "post-1",
          initialIsLiked: false,
          initialLikeCount: 5,
        },
      },
    );

    expect(result.current.isLiked).toBe(false);
    expect(result.current.likeCount).toBe(5);

    rerender({
      itemId: "post-2",
      initialIsLiked: true,
      initialLikeCount: 10,
    });

    expect(result.current.isLiked).toBe(true);
    expect(result.current.likeCount).toBe(10);
  });
});
