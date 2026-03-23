import { createContext } from "react";

export type PageCacheEntry = {
  items: unknown[];
  cursor: string | null;
  scrollTop: number;
  activeTab?: string;
};

export type PageCacheContextType = {
  saveCache: (key: string, entry: PageCacheEntry) => void;
  restoreCache: (key: string) => PageCacheEntry | null;
  clearCache: (key: string) => void;
  clearAllCache: () => void;
};

export const PageCacheContext = createContext<PageCacheContextType | null>(
  null,
);
