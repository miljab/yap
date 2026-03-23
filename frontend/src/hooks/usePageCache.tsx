import { useContext } from "react";
import { PageCacheContext } from "@/context/PageCacheContext";

export function usePageCache() {
  const context = useContext(PageCacheContext);

  if (!context) {
    throw new Error("usePageCache must be used within PageCacheProvider");
  }

  return context;
}
