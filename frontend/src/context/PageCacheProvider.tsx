import { useRef, useCallback, type ReactNode } from "react";
import type { PageCacheEntry, PageCacheContextType } from "./PageCacheContext";
import { PageCacheContext } from "./PageCacheContext";

type PageCacheProviderProps = {
  children: ReactNode;
};
export const PageCacheProvider = ({ children }: PageCacheProviderProps) => {
  const cacheRef = useRef(new Map<string, PageCacheEntry>());

  const saveCache = useCallback((key: string, entry: PageCacheEntry) => {
    cacheRef.current.set(key, entry);
  }, []);

  const restoreCache = useCallback((key: string): PageCacheEntry | null => {
    return cacheRef.current.get(key) ?? null;
  }, []);

  const clearCache = useCallback((key: string) => {
    cacheRef.current.delete(key);
  }, []);

  const clearAllCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  const value: PageCacheContextType = {
    saveCache,
    restoreCache,
    clearCache,
    clearAllCache,
  };

  return (
    <PageCacheContext.Provider value={value}>
      {children}
    </PageCacheContext.Provider>
  );
};
