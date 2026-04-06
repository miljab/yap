import { useState, useEffect, useCallback, type ReactNode } from "react";
import { axiosPrivate } from "@/api/axios";
import useAuth from "@/hooks/useAuth";
import { FollowContext } from "./FollowContext";

type FollowProviderProps = {
  children: ReactNode;
};

export const FollowProvider = ({ children }: FollowProviderProps) => {
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const { auth } = useAuth();
  const authUser = auth?.user;

  useEffect(() => {
    const fetchFollowing = async () => {
      if (!authUser?.id) {
        return;
      }

      try {
        const response = await axiosPrivate.get<{ followingIds: string[] }>("/users/me/following-ids");
        const ids = new Set<string>(response.data.followingIds);
        setFollowingIds(ids);
      } catch (error) {
        console.error("Failed to fetch following list:", error);
      }
    };

    fetchFollowing();
  }, [authUser?.id]);

  useEffect(() => {
    if (!authUser?.id) {
      setFollowingIds(new Set());
    }
  }, [authUser?.id]);

  const isFollowing = useCallback(
    (userId: string) => followingIds.has(userId),
    [followingIds],
  );

  const toggleFollow = useCallback(
    async (userId: string) => {
      if (!authUser?.id) {
        return;
      }

      const wasFollowing = followingIds.has(userId);

      setFollowingIds((prev) => {
        const next = new Set(prev);
        if (wasFollowing) {
          next.delete(userId);
        } else {
          next.add(userId);
        }
        return next;
      });

      try {
        const response = await axiosPrivate.put(`/users/${userId}/follow`);
        setFollowingIds((prev) => {
          const next = new Set(prev);
          if (response.data.isFollowed) {
            next.add(userId);
          } else {
            next.delete(userId);
          }
          return next;
        });
      } catch (error) {
        console.error(error);
        setFollowingIds((prev) => {
          const next = new Set(prev);
          if (wasFollowing) {
            next.add(userId);
          } else {
            next.delete(userId);
          }
          return next;
        });
      }
    },
    [followingIds, authUser],
  );

  return (
    <FollowContext.Provider value={{ followingIds, isFollowing, toggleFollow }}>
      {children}
    </FollowContext.Provider>
  );
};
