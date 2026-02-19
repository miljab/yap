import type { User } from "@/types/user";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useState, useCallback, useEffect, useRef } from "react";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import UserAvatar from "./user_components/UserAvatar";
import { Spinner } from "./ui/spinner";
import FollowButton from "./FollowButton";
import useAuthenticatedUser from "@/hooks/useAuthenticatedUser";

type FollowListProps = {
  type: "following" | "followers";
  count: number;
  user: User;
};

function FollowList({ type, count, user }: FollowListProps) {
  const [follows, setFollows] = useState<User[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const axiosPrivate = useAxiosPrivate();
  const authenticatedUser = useAuthenticatedUser();

  const fetchFollows = useCallback(
    async (currentCursor?: string) => {
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;

      try {
        setIsLoading(true);
        const url = currentCursor
          ? `/users/${user.id}/${type}?cursor=${currentCursor}`
          : `/users/${user.id}/${type}`;
        const response = await axiosPrivate.get(url);

        setFollows((prev) =>
          currentCursor
            ? [...prev, ...response.data.users]
            : response.data.users,
        );
        setCursor(response.data.nextCursor);
        setHasMore(response.data.nextCursor !== null);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
        setInitialLoad(false);
        isLoadingRef.current = false;
      }
    },
    [axiosPrivate, user.id, type],
  );

  useEffect(() => {
    if (isOpen) {
      setFollows([]);
      setCursor(null);
      setHasMore(true);
      setInitialLoad(true);
      fetchFollows();
    }
  }, [isOpen, fetchFollows]);

  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isLoading &&
          !initialLoad
        ) {
          fetchFollows(cursor ?? undefined);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(loader);

    return () => observer.disconnect();
  }, [cursor, hasMore, isLoading, initialLoad, fetchFollows]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          disabled={count === 0}
          className="not-disabled:cursor-pointer not-disabled:hover:underline"
        >
          {count} {type}
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === "following"
              ? `${user.username} is following...`
              : `${user.username} is followed by...`}
          </DialogTitle>
        </DialogHeader>

        {initialLoad ? (
          <div className="flex justify-center p-4">
            <Spinner />
          </div>
        ) : follows.length === 0 ? (
          <div className="p-4 text-center text-neutral-500">No {type} yet</div>
        ) : (
          <div className="flex max-h-[500px] flex-col gap-2 overflow-auto">
            {follows.map((follow, idx) => (
              <div
                key={follow.id}
                className={`flex items-center gap-2 p-1 ${idx !== follows.length - 1 && "border-b-1"}`}
              >
                <UserAvatar
                  avatarUrl={follow.avatar}
                  username={follow.username}
                />
                <span>{follow.username}</span>
                {authenticatedUser.id !== follow.id && (
                  <div className="flex grow justify-end">
                    <FollowButton
                      initialIsFollowed={follow.isFollowed}
                      userId={follow.id}
                    />
                  </div>
                )}
              </div>
            ))}
            <div ref={loaderRef} className="flex justify-center p-2">
              {isLoading && <Spinner />}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default FollowList;
