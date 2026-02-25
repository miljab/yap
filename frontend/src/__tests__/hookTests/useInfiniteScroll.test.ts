import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { describe, vi, beforeEach, it, expect } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

describe("useInfiniteScroll", () => {
  let mockIntersectionObserver: {
    observe: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    unobserve: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockIntersectionObserver = {
      observe: vi.fn(),
      disconnect: vi.fn(),
      unobserve: vi.fn(),
    };

    vi.stubGlobal(
      "IntersectionObserver",
      vi.fn(() => mockIntersectionObserver),
    );
  });

  it("initializes with empty items and loading state", () => {
    const fetcher = vi.fn().mockResolvedValue({ items: [], nextCursor: null });

    const { result } = renderHook(() => useInfiniteScroll(fetcher));

    expect(result.current.items).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.initialLoad).toBe(true);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.cursor).toBe(null);
  });

  it("fetches initial data on mount", async () => {
    const mockItems = [{ id: "1" }, { id: "2" }];
    const fetcher = vi.fn().mockResolvedValue({
      items: mockItems,
      nextCursor: "cursor-1",
    });

    const { result } = renderHook(() => useInfiniteScroll(fetcher));

    await waitFor(() => {
      expect(fetcher).toHaveBeenCalledWith(undefined);
    });

    await waitFor(() => {
      expect(result.current.items).toEqual(mockItems);
    });

    expect(result.current.initialLoad).toBe(false);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.cursor).toBe("cursor-1");
  });

  it("sets hasMore to false when nextCursor is null", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue({ items: [{ id: "1" }], nextCursor: null });

    const { result } = renderHook(() => useInfiniteScroll(fetcher));

    await waitFor(() => expect(result.current.items.length).toBe(1));

    expect(result.current.hasMore).toBe(false);
  });

  it("resets state when reset is called", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue({ items: [{ id: "1" }], nextCursor: null });

    const { result } = renderHook(() => useInfiniteScroll(fetcher));

    await waitFor(() => expect(result.current.items.length).toBe(1));

    act(() => {
      result.current.reset();
    });

    expect(result.current.items).toEqual([]);
    expect(result.current.cursor).toBe(null);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.initialLoad).toBe(true);
  });

  it("resets when deps change", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue({ items: [{ id: "1" }], nextCursor: null });

    const { result, rerender } = renderHook(
      ({ filter }) => useInfiniteScroll(fetcher, [filter]),
      { initialProps: { filter: "all" } },
    );

    await waitFor(() => expect(result.current.items.length).toBe(1));

    rerender({ filter: "new" });

    expect(result.current.items).toEqual([]);
    expect(result.current.initialLoad).toBe(true);
  });

  it("does not fetch when hasMore is false", async () => {
    const fetcher = vi.fn().mockResolvedValue({ items: [], nextCursor: null });

    const { result } = renderHook(() => useInfiniteScroll(fetcher));

    await waitFor(() => expect(result.current.hasMore).toBe(false));

    const initialCallCount = fetcher.mock.calls.length;

    act(() => {
      if (mockIntersectionObserver.observe.mock.calls[0]) {
        mockIntersectionObserver.observe.mock.calls[0][0]?.();
      }
    });

    expect(fetcher.mock.calls.length).toBe(initialCallCount);
  });

  it("handles fetch error gracefully", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const fetcher = vi.fn().mockRejectedValue(new Error("Fetch failed"));

    const { result } = renderHook(() => useInfiniteScroll(fetcher));

    await waitFor(() => expect(result.current.initialLoad).toBe(false));

    expect(result.current.items).toEqual([]);
    expect(result.current.isLoading).toBe(false);

    consoleError.mockRestore();
  });

  it("allows setting items externally via setItems", async () => {
    const fetcher = vi.fn().mockResolvedValue({ items: [], nextCursor: null });

    const { result } = renderHook(() => useInfiniteScroll(fetcher));

    act(() => {
      result.current.setItems([{ id: "external-1" }]);
    });

    expect(result.current.items).toEqual([{ id: "external-1" }]);
  });

  it("sets cursor from fetcher response", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      items: [{ id: "1" }],
      nextCursor: "abc-123",
    });

    const { result } = renderHook(() => useInfiniteScroll(fetcher));

    await waitFor(() => expect(result.current.cursor).toBe("abc-123"));
  });
});
