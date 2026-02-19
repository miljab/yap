import { useState, useRef, useEffect, useCallback } from "react";

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

  const loaderRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);
  const fetcherRef = useRef(fetcher);

  fetcherRef.current = fetcher;

  const fetchNext = useCallback(async () => {
    if (isFetchingRef.current || !hasMore) return;

    isFetchingRef.current = true;
    setIsLoading(true);

    try {
      const result = await fetcherRef.current(cursor ?? undefined);

      setItems((prev) => (cursor ? [...prev, ...result.items] : result.items));
      setCursor(result.nextCursor);
      setHasMore(result.nextCursor !== null);
    } catch (error) {
      console.error(error);
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
    isFetchingRef.current = false;
  }, []);

  useEffect(() => {
    reset();
    fetchNext();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !initialLoad)
          fetchNext();
      },
      { threshold: 0.1 },
    );

    observer.observe(loader);
    return () => observer.disconnect();
  }, [hasMore, isLoading, initialLoad, fetchNext]);

  return {
    items,
    setItems,
    cursor,
    hasMore,
    isLoading,
    initialLoad,
    loaderRef,
    reset,
  };
}
