import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
} from "react";
import { type FetchErrorState, getErrorState } from "@/lib/fetchError";
import { usePageCache } from "./usePageCache";
import { useNavigationType, useLocation, NavigationType } from "react-router";
import type { NavigationState } from "@/types/navigation";

type CacheState<T> = {
  items: T[];
  cursor: string | null;
  scrollTop: number;
};

type FetcherResult<T> = {
  items: T[];
  nextCursor: string | null;
};

type Fetcher<T> = (cursor?: string) => Promise<FetcherResult<T>>;

type UseInfiniteScrollReturn<T> = {
  items: T[];
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  cursor: string | null;
  hasMore: boolean;
  isLoading: boolean;
  initialLoad: boolean;
  loaderRef: React.RefObject<HTMLDivElement | null>;
  reset: () => void;
  error: FetchErrorState | null;
  retry: () => Promise<void>;
  activeTab?: string;
};

export function useInfiniteScroll<T>(
  fetcher: Fetcher<T>,
  deps: React.DependencyList = [],
  cache?: {
    key: string;
    activeTab?: string;
  },
): UseInfiniteScrollReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState<FetchErrorState | null>(null);

  const loaderRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);
  const fetcherRef = useRef(fetcher);
  const cursorRef = useRef(cursor);
  const hasMoreRef = useRef(hasMore);
  const cacheStateRef = useRef<CacheState<T>>({
    items: [],
    cursor: null,
    scrollTop: 0,
  });

  cursorRef.current = cursor;
  hasMoreRef.current = hasMore;

  cacheStateRef.current = {
    items,
    cursor,
    scrollTop: cacheStateRef.current.scrollTop,
  };

  const pageCache = usePageCache();
  const navType = useNavigationType();
  const location = useLocation();

  fetcherRef.current = fetcher;

  const fetchNext = useCallback(async () => {
    if (isFetchingRef.current || !hasMoreRef.current) return;

    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcherRef.current(cursorRef.current ?? undefined);

      setItems((prev) =>
        cursorRef.current ? [...prev, ...result.items] : result.items,
      );
      setCursor(result.nextCursor);
      setHasMore(result.nextCursor !== null);
    } catch (err) {
      console.error(err);
      setError(getErrorState(err));
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
      setInitialLoad(false);
    }
  }, []);

  const reset = useCallback(() => {
    setItems([]);
    setCursor(null);
    setHasMore(true);
    setInitialLoad(true);
    setError(null);
    isFetchingRef.current = false;
  }, []);

  useEffect(() => {
    if (pendingActionRef.current === "none" && cache) {
      return;
    }
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const pendingActionRef = useRef<"fetch" | "none">("none");

  useLayoutEffect(() => {
    if (!initialLoad || isLoading) return;

    if (!cache) {
      pendingActionRef.current = "fetch";
      return;
    }

    const cached = pageCache.restoreCache(cache.key);
    const isBackNavigation =
      navType === NavigationType.Pop ||
      (location.state as NavigationState)?.restoreCache === true;

    if (isBackNavigation && cached && cached.items.length > 0) {
      const restoredItems = cached.items as T[];
      const scrollTop = cached.scrollTop || 0;

      cacheStateRef.current = {
        items: restoredItems,
        cursor: cached.cursor,
        scrollTop,
      };

      setItems(restoredItems);
      setCursor(cached.cursor);
      setHasMore(cached.cursor !== null);
      setInitialLoad(false);
      setError(null);
      pendingActionRef.current = "none";

      requestAnimationFrame(() => {
        const root = document.getElementById("root");
        if (root) root.scrollTop = scrollTop;
      });
    } else {
      pendingActionRef.current = "fetch";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLoad, isLoading]);

  useEffect(() => {
    if (pendingActionRef.current !== "fetch") return;

    pendingActionRef.current = "none";

    if (cache) {
      pageCache.clearCache(cache.key);
    }

    fetchNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLoad, isLoading]);

  useEffect(() => {
    return () => {
      if (!cache || !pageCache) return;

      const {
        items: currentItems,
        cursor: currentCursor,
        scrollTop,
      } = cacheStateRef.current;

      pageCache.saveCache(cache.key, {
        items: currentItems,
        cursor: currentCursor,
        scrollTop,
        activeTab: cache.activeTab,
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cache]);

  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isLoading &&
          !initialLoad &&
          !error
        )
          fetchNext();
      },
      { threshold: 0.1 },
    );

    observer.observe(loader);
    return () => observer.disconnect();
  }, [hasMore, isLoading, initialLoad, error]);

  useEffect(() => {
    if (!cache) return;

    const handleScroll = () => {
      const root = document.getElementById("root");
      if (root) {
        cacheStateRef.current.scrollTop = root.scrollTop;
      }
    };

    const root = document.getElementById("root");
    if (root) {
      root.addEventListener("scroll", handleScroll);
      return () => root.removeEventListener("scroll", handleScroll);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cache?.key]);

  return {
    items,
    setItems,
    cursor,
    hasMore,
    isLoading,
    initialLoad,
    loaderRef,
    reset,
    error,
    retry: fetchNext,
    activeTab: cache?.activeTab,
  };
}
