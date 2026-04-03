import { useCachedInfiniteScroll } from "@/hooks/useCachedInfiniteScroll";
import { usePageCache } from "@/hooks/usePageCache";
import { describe, vi, beforeEach, it, expect, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

const mockUseNavigationType = vi.fn();
const mockUseLocation = vi.fn(() => ({ state: {} }));

vi.mock("react-router", () => ({
  useNavigationType: (...args: unknown[]) => mockUseNavigationType(...args),
  useLocation: () => mockUseLocation(),
  NavigationType: {
    Pop: "pop",
    Push: "push",
    Replace: "replace",
  },
}));

vi.mock("@/hooks/usePageCache", () => ({
  usePageCache: vi.fn(),
}));

const mockIntersectionObserver = {
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
};

vi.stubGlobal("IntersectionObserver", vi.fn(() => mockIntersectionObserver));

describe("useCachedInfiniteScroll", () => {
  let mockPageCache: {
    saveCache: ReturnType<typeof vi.fn>;
    restoreCache: ReturnType<typeof vi.fn>;
    clearCache: ReturnType<typeof vi.fn>;
    clearAllCache: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockIntersectionObserver.observe.mockClear();
    mockIntersectionObserver.disconnect.mockClear();
    mockUseNavigationType.mockReturnValue("push");
    mockUseLocation.mockReturnValue({ state: {} });

    mockPageCache = {
      saveCache: vi.fn(),
      restoreCache: vi.fn().mockReturnValue(null),
      clearCache: vi.fn(),
      clearAllCache: vi.fn(),
    };

    (usePageCache as ReturnType<typeof vi.fn>).mockReturnValue(mockPageCache);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes with empty items and loading state on push navigation", async () => {
    mockUseNavigationType.mockReturnValue("push");

    const fetcher = vi.fn().mockResolvedValue({ items: [], nextCursor: null });
    const { result } = renderHook(() =>
      useCachedInfiniteScroll(fetcher, [], "test-cache"),
    );

    expect(result.current.items).toEqual([]);
    expect(result.current.isLoading).toBe(true);

    await act(async () => {});
  });

  it("fetches data on mount", async () => {
    mockUseNavigationType.mockReturnValue("push");

    const mockItems = [{ id: "1" }, { id: "2" }];
    const fetcher = vi.fn().mockResolvedValue({
      items: mockItems,
      nextCursor: "cursor-1",
    });

    const { result } = renderHook(() =>
      useCachedInfiniteScroll(fetcher, [], "test-cache"),
    );

    await waitFor(() => {
      expect(result.current.items).toEqual(mockItems);
    });
  });

  it("restores cached data on back navigation (Pop)", async () => {
    mockUseNavigationType.mockReturnValue("pop");

    const cachedData = {
      items: [{ id: "cached-1" }, { id: "cached-2" }],
      cursor: "cached-cursor",
      scrollTop: 100,
    };

    mockPageCache.restoreCache.mockReturnValue(cachedData);

    const fetcher = vi.fn().mockResolvedValue({ items: [], nextCursor: null });
    const { result } = renderHook(() =>
      useCachedInfiniteScroll(fetcher, [], "test-cache"),
    );

    await waitFor(() => {
      expect(result.current.items).toEqual(cachedData.items);
    });

    expect(fetcher).not.toHaveBeenCalled();
  });

  it("restores cached data when location.state.restoreCache is true", async () => {
    mockUseLocation.mockReturnValue({
      state: { restoreCache: true },
    });

    const cachedData = {
      items: [{ id: "restored-1" }],
      cursor: "restored-cursor",
      scrollTop: 50,
    };

    mockPageCache.restoreCache.mockReturnValue(cachedData);

    const fetcher = vi.fn().mockResolvedValue({ items: [], nextCursor: null });
    const { result } = renderHook(() =>
      useCachedInfiniteScroll(fetcher, [], "test-cache"),
    );

    await waitFor(() => {
      expect(result.current.items).toEqual(cachedData.items);
    });
  });

  it("clears cache on push navigation", async () => {
    mockUseNavigationType.mockReturnValue("push");

    const fetcher = vi.fn().mockResolvedValue({ items: [], nextCursor: null });
    renderHook(() => useCachedInfiniteScroll(fetcher, [], "test-cache"));

    expect(mockPageCache.clearCache).toHaveBeenCalledWith("test-cache");

    await act(async () => {});
  });

  it("resets state when deps change", async () => {
    mockUseNavigationType.mockReturnValue("push");

    const fetcher = vi.fn().mockResolvedValue({
      items: [{ id: "1" }],
      nextCursor: null,
    });

    const { result, rerender } = renderHook(
      ({ filter }: { filter: string }) =>
        useCachedInfiniteScroll(fetcher, [filter], "test-cache"),
      { initialProps: { filter: "all" } },
    );

    await waitFor(() => expect(result.current.items.length).toBe(1));

    rerender({ filter: "new" });

    expect(result.current.items).toEqual([]);
    expect(result.current.initialLoad).toBe(true);

    await act(async () => {});
  });

  it("saves cache on unmount with populated items", async () => {
    mockUseNavigationType.mockReturnValue("push");

    const mockItems = [{ id: "1" }, { id: "2" }];
    const fetcher = vi.fn().mockResolvedValue({
      items: mockItems,
      nextCursor: "cursor-1",
    });

    const { result, unmount } = renderHook(() =>
      useCachedInfiniteScroll(fetcher, [], "test-cache"),
    );

    await waitFor(() => expect(result.current.items.length).toBe(2));

    unmount();

    expect(mockPageCache.saveCache).toHaveBeenCalledWith(
      "test-cache",
      expect.objectContaining({
        items: mockItems,
        cursor: "cursor-1",
      }),
    );
  });

  it("restores scroll position on back navigation", async () => {
    mockUseNavigationType.mockReturnValue("pop");

    const cachedData = {
      items: [{ id: "cached-1" }],
      cursor: "cached-cursor",
      scrollTop: 250,
    };

    mockPageCache.restoreCache.mockReturnValue(cachedData);

    const root = document.createElement("div");
    root.id = "root";
    document.body.appendChild(root);

    const fetcher = vi.fn().mockResolvedValue({ items: [], nextCursor: null });
    const { result } = renderHook(() =>
      useCachedInfiniteScroll(fetcher, [], "test-cache"),
    );

    await waitFor(() => expect(result.current.items.length).toBe(1));

    expect(result.current.items).toEqual(cachedData.items);
    expect(root.scrollTop).toBe(250);

    document.body.removeChild(root);
  });

  it("returns error state on fetch failure", async () => {
    mockUseNavigationType.mockReturnValue("push");

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const fetcher = vi.fn().mockRejectedValue(new Error("Fetch failed"));

    const { result } = renderHook(() =>
      useCachedInfiniteScroll(fetcher, [], "test-cache"),
    );

    await waitFor(() => expect(result.current.initialLoad).toBe(false));

    expect(result.current.error).toBeTruthy();
    consoleError.mockRestore();
  });

  it("handles empty cache gracefully on back navigation", async () => {
    mockUseNavigationType.mockReturnValue("pop");
    mockPageCache.restoreCache.mockReturnValue(null);

    const mockItems = [{ id: "1" }];
    const fetcher = vi.fn().mockResolvedValue({
      items: mockItems,
      nextCursor: "cursor-1",
    });

    const { result } = renderHook(() =>
      useCachedInfiniteScroll(fetcher, [], "test-cache"),
    );

    await waitFor(() => {
      expect(result.current.items).toEqual(mockItems);
    });
  });

  it("allows setting items externally via setItems", async () => {
    mockUseNavigationType.mockReturnValue("push");

    const fetcher = vi.fn().mockResolvedValue({ items: [], nextCursor: null });

    const { result } = renderHook(() =>
      useCachedInfiniteScroll(fetcher, [], "test-cache"),
    );

    act(() => {
      result.current.setItems([{ id: "external-1" }]);
    });

    expect(result.current.items).toEqual([{ id: "external-1" }]);

    await act(async () => {});
  });

  it("loads more pages when cursor is present", async () => {
    mockUseNavigationType.mockReturnValue("push");

    const fetcher = vi.fn()
      .mockResolvedValueOnce({
        items: [{ id: "1" }],
        nextCursor: "cursor-1",
      })
      .mockResolvedValueOnce({
        items: [{ id: "2" }],
        nextCursor: null,
      });

    const { result } = renderHook(() =>
      useCachedInfiniteScroll(fetcher, [], "test-cache"),
    );

    await waitFor(() => {
      expect(result.current.items).toEqual([{ id: "1" }]);
    });

    await act(async () => {
      await result.current.retry();
    });

    await waitFor(() => {
      expect(result.current.items).toEqual([{ id: "1" }, { id: "2" }]);
    });

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher).toHaveBeenNthCalledWith(2, "cursor-1");
  });

  it("retries failed fetch", async () => {
    mockUseNavigationType.mockReturnValue("push");

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const fetcher = vi.fn()
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({
        items: [{ id: "recovered" }],
        nextCursor: null,
      });

    const { result } = renderHook(() =>
      useCachedInfiniteScroll(fetcher, [], "test-cache"),
    );

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    await act(async () => {
      await result.current.retry();
    });

    await waitFor(() => {
      expect(result.current.items).toEqual([{ id: "recovered" }]);
      expect(result.current.error).toBeNull();
    });

    consoleError.mockRestore();
  });

  it("tracks scroll position and saves on unmount", async () => {
    mockUseNavigationType.mockReturnValue("push");

    const root = document.createElement("div");
    root.id = "root";
    document.body.appendChild(root);

    const mockItems = [{ id: "1" }];
    const fetcher = vi.fn().mockResolvedValue({
      items: mockItems,
      nextCursor: "cursor-1",
    });

    const { result, unmount } = renderHook(() =>
      useCachedInfiniteScroll(fetcher, [], "test-cache"),
    );

    await waitFor(() => expect(result.current.items.length).toBe(1));

    root.scrollTop = 500;
    root.dispatchEvent(new Event("scroll"));

    unmount();

    expect(mockPageCache.saveCache).toHaveBeenCalledWith(
      "test-cache",
      expect.objectContaining({
        scrollTop: 500,
      }),
    );

    document.body.removeChild(root);
  });

  it("handles unmount during in-flight fetch", async () => {
    mockUseNavigationType.mockReturnValue("push");

    let resolveFetcher: (value: { items: { id: string }[]; nextCursor: null }) => void;
    const fetcher = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetcher = resolve;
        }),
    );

    const { unmount } = renderHook(() =>
      useCachedInfiniteScroll(fetcher, [], "test-cache"),
    );

    expect(fetcher).toHaveBeenCalledTimes(1);

    unmount();

    expect(mockPageCache.saveCache).toHaveBeenCalledWith(
      "test-cache",
      expect.objectContaining({
        items: [],
      }),
    );

    await act(async () => {
      resolveFetcher!({ items: [{ id: "late" }], nextCursor: null });
    });
  });

  it("does not fetch when restored from cache on back navigation", async () => {
    mockUseNavigationType.mockReturnValue("pop");

    const cachedData = {
      items: [{ id: "cached" }],
      cursor: null,
      scrollTop: 0,
    };

    mockPageCache.restoreCache.mockReturnValue(cachedData);

    const fetcher = vi.fn().mockResolvedValue({
      items: [{ id: "fresh" }],
      nextCursor: null,
    });

    const { result } = renderHook(() =>
      useCachedInfiniteScroll(fetcher, [], "test-cache"),
    );

    await waitFor(() => {
      expect(result.current.items).toEqual([{ id: "cached" }]);
    });

    expect(fetcher).not.toHaveBeenCalled();
  });

  it("saves empty items on unmount when no data was loaded", async () => {
    mockUseNavigationType.mockReturnValue("push");

    let resolveFetcher: (value: { items: { id: string }[]; nextCursor: null }) => void;
    const fetcher = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetcher = resolve;
        }),
    );

    const { unmount } = renderHook(() =>
      useCachedInfiniteScroll(fetcher, [], "test-cache"),
    );

    unmount();

    expect(mockPageCache.saveCache).toHaveBeenCalledWith(
      "test-cache",
      expect.objectContaining({
        items: [],
        cursor: null,
      }),
    );

    await act(async () => {
      resolveFetcher!({ items: [{ id: "late" }], nextCursor: null });
    });
  });

  it("does not restore cache when cached items array is empty", async () => {
    mockUseNavigationType.mockReturnValue("pop");

    mockPageCache.restoreCache.mockReturnValue({
      items: [],
      cursor: "stale-cursor",
      scrollTop: 100,
    });

    const mockItems = [{ id: "fresh-1" }];
    const fetcher = vi.fn().mockResolvedValue({
      items: mockItems,
      nextCursor: "cursor-1",
    });

    const { result } = renderHook(() =>
      useCachedInfiniteScroll(fetcher, [], "test-cache"),
    );

    await waitFor(() => {
      expect(result.current.items).toEqual(mockItems);
    });

    expect(fetcher).toHaveBeenCalled();
  });
});
