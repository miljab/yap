import { createContext } from "react";

type FollowContextType = {
  followingIds: Set<string>;
  isFollowing: (userId: string) => boolean;
  toggleFollow: (userId: string) => Promise<void>;
};

export const FollowContext = createContext<FollowContextType>({
  followingIds: new Set(),
  isFollowing: () => false,
  toggleFollow: async () => {},
});
