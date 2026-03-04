import { useState, useRef, useEffect, useCallback } from "react";
import { type FetchErrorState, getErrorState } from "@/lib/fetchError";

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
};

export function useInfiniteScroll<T>(
  fetcher: Fetcher<T>,
  deps: React.DependencyList = [],
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

  fetcherRef.current = fetcher;

  const fetchNext = useCallback(async () => {
    if (isFetchingRef.current || !hasMore) return;

    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcherRef.current(cursor ?? undefined);

      setItems((prev) => (cursor ? [...prev, ...result.items] : result.items));
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
  }, [cursor, hasMore]);

  const reset = useCallback(() => {
    setItems([]);
    setCursor(null);
    setHasMore(true);
    setInitialLoad(true);
    setError(null);
    isFetchingRef.current = false;
  }, []);

  // Reset when deps change
  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // Initial fetch when in initialLoad state
  useEffect(() => {
    if (initialLoad && !isLoading) {
      fetchNext();
    }
  }, [initialLoad, isLoading, fetchNext]);

  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !initialLoad && !error)
          fetchNext();
      },
      { threshold: 0.1 },
    );

    observer.observe(loader);
    return () => observer.disconnect();
  }, [hasMore, isLoading, initialLoad, error, fetchNext]);

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
  };
}
