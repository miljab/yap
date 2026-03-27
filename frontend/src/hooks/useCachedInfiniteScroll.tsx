import { useRef, useEffect } from "react";
import { useInfiniteScroll } from "./useInfiniteScroll";
import { usePageCache } from "./usePageCache";
import { useNavigationType, useLocation, NavigationType } from "react-router";
import type { NavigationState } from "@/types/navigation";

type RestoredData<T> = {
  items: T[];
  cursor: string | null;
  scrollTop: number;
};

type FetcherResult<T> = {
  items: T[];
  nextCursor: string | null;
};

type Fetcher<T> = (cursor?: string) => Promise<FetcherResult<T>>;

export function useCachedInfiniteScroll<T>(
  fetcher: Fetcher<T>,
  deps: React.DependencyList,
  cacheKey: string,
) {
  const pageCache = usePageCache();
  const navType = useNavigationType();
  const location = useLocation();

  const isBackNavigation =
    navType === NavigationType.Pop ||
    (location.state as NavigationState)?.restoreCache === true;

  const restoredDataRef = useRef<RestoredData<T> | null>(null);
  const hasCheckedCacheRef = useRef(false);

  if (!hasCheckedCacheRef.current) {
    hasCheckedCacheRef.current = true;

    if (isBackNavigation) {
      const cached = pageCache.restoreCache(cacheKey);
      if (cached && cached.items.length > 0) {
        restoredDataRef.current = {
          items: cached.items as T[],
          cursor: cached.cursor,
          scrollTop: cached.scrollTop || 0,
        };
      }
    } else {
      pageCache.clearCache(cacheKey);
    }
  }

  const initialData = restoredDataRef.current;

  const {
    items,
    setItems,
    cursor,
    isLoading,
    initialLoad,
    loaderRef,
    error,
    retry,
  } = useInfiniteScroll<T>(fetcher, deps, initialData);

  const hasRestoredScrollRef = useRef(false);
  const scrollTopToRestore = restoredDataRef.current?.scrollTop ?? 0;

  useEffect(() => {
    if (hasRestoredScrollRef.current) return;
    if (!restoredDataRef.current) return;
    if (items.length === 0) return;

    hasRestoredScrollRef.current = true;

    const root = document.getElementById("root");
    if (root) root.scrollTop = scrollTopToRestore;
  }, [items.length, scrollTopToRestore]);

  const scrollTopRef = useRef(restoredDataRef.current?.scrollTop ?? 0);

  useEffect(() => {
    const handleScroll = () => {
      const root = document.getElementById("root");
      if (root) scrollTopRef.current = root.scrollTop;
    };

    const root = document.getElementById("root");
    if (root) {
      root.addEventListener("scroll", handleScroll);
      return () => root.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const itemsRef = useRef(items);
  const cursorRef = useRef(cursor);
  itemsRef.current = items;
  cursorRef.current = cursor;

  useEffect(() => {
    return () => {
      pageCache.saveCache(cacheKey, {
        items: itemsRef.current,
        cursor: cursorRef.current,
        scrollTop: scrollTopRef.current,
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return {
    items,
    setItems,
    cursor,
    isLoading,
    initialLoad,
    loaderRef,
    error,
    retry,
  };
}
