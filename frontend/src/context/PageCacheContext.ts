import { createContext } from "react";

type PageCacheEntry = {
  items: unknown[];
  cursor: string | null;
  scrollTop: number;
  activeTab?: string;
};

type PageCacheContextType = {
  saveCache: (key: string, entry: PageCacheEntry) => void;
  restoreCache: (key: string) => PageCacheEntry | null;
  clearCache: (key: string) => void;
  clearAllCache: () => void;
};

export const PageCacheContext = createContext<PageCacheContextType | null>(
  null,
);
