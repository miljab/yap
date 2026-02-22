import type { User } from "@/types/user";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useState, useCallback } from "react";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import UserAvatar from "./user_components/UserAvatar";
import { Spinner } from "./ui/spinner";
import FollowButton from "./FollowButton";
import useAuthenticatedUser from "@/hooks/useAuthenticatedUser";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { Link } from "react-router";

type FollowListProps = {
  type: "following" | "followers";
  count: number;
  user: User;
};

function FollowList({ type, count, user }: FollowListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const axiosPrivate = useAxiosPrivate();
  const authenticatedUser = useAuthenticatedUser();

  const fetchFollows = useCallback(
    async (currentCursor?: string) => {
      const url = currentCursor
        ? `/users/${user.id}/${type}?cursor=${currentCursor}`
        : `/users/${user.id}/${type}`;
      const response = await axiosPrivate.get(url);

      return {
        items: response.data.users,
        nextCursor: response.data.nextCursor,
      };
    },
    [axiosPrivate, user.id, type],
  );

  const {
    items: follows,
    isLoading,
    initialLoad,
    loaderRef,
  } = useInfiniteScroll<User>(fetchFollows, [isOpen, user.id, type]);

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
          <div className="flex max-h-[500px] flex-col overflow-auto">
            {follows.map((follow, idx) => (
              <div
                key={follow.id}
                className={`flex items-center gap-2 p-2 ${idx !== follows.length - 1 && "border-b-1"}`}
              >
                <UserAvatar
                  avatarUrl={follow.avatar}
                  username={follow.username}
                />
                <div className="flex grow flex-col">
                  <Link
                    to={`/profile/${follow.username}`}
                    className="cursor-pointer wrap-break-word contain-inline-size hover:underline"
                    onClick={() => setIsOpen(false)}
                  >
                    {follow.username}
                  </Link>
                  <p className="truncate wrap-break-word text-neutral-500 contain-inline-size">
                    {follow.bio}
                  </p>
                </div>
                {authenticatedUser.id !== follow.id && (
                  <div className="flex justify-end">
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
