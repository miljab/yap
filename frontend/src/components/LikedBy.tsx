import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import UserAvatar from "./user_components/UserAvatar";
import { Link } from "react-router";
import { useState, useCallback } from "react";
import type { User } from "@/types/user";
import { axiosPrivate } from "@/api/axios";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { Spinner } from "./ui/spinner";
import FetchError from "./FetchError";
import UserHoverCard from "./user_components/UserHoverCard";

type LikedByProps = {
  likeCount: number;
  type: "post" | "comment";
  id: string;
};

function LikedBy({ likeCount, type, id }: LikedByProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="cursor-pointer hover:underline">{likeCount}</button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Liked by</DialogTitle>
        </DialogHeader>

        {isOpen && <LikersList id={id} type={type} />}
      </DialogContent>
    </Dialog>
  );
}

function LikersList({ id, type }: { id: string; type: "post" | "comment" }) {
  const fetchLikers = useCallback(
    async (currentCursor?: string) => {
      let url: string;

      if (type === "post") {
        url = currentCursor
          ? `/post/${id}/likes?cursor=${currentCursor}`
          : `/post/${id}/likes`;
      } else {
        url = currentCursor
          ? `/comment/${id}/likes?cursor=${currentCursor}`
          : `/comment/${id}/likes`;
      }

      const response = await axiosPrivate.get(url);

      return {
        items: response.data.users,
        nextCursor: response.data.nextCursor,
      };
    },
    [id, type],
  );

  const { items, isLoading, initialLoad, loaderRef, error, retry } =
    useInfiniteScroll<User>(fetchLikers, [id, type]);

  return (
    <>
      {initialLoad ? (
        <div className="flex justify-center p-4">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        error ? (
          <FetchError error={error} onRetry={retry} />
        ) : (
          <div className="p-4 text-center text-neutral-500">No likes yet</div>
        )
      ) : (
        <div className="flex max-h-[500px] flex-col gap-2 overflow-auto">
          {items.map((user, idx) => {
            return (
              <div
                key={user.id}
                className={`flex items-center gap-2 p-1 ${idx !== items.length - 1 && "border-b-1"}`}
              >
                <UserHoverCard username={user.username}>
                  <span>
                    <UserAvatar
                      avatarUrl={user.avatarUrl}
                      username={user.username}
                    />
                  </span>
                </UserHoverCard>
                <UserHoverCard username={user.username}>
                  <Link
                    to={`/profile/${user.username}`}
                    className="cursor-pointer truncate hover:underline"
                  >
                    {user.username}
                  </Link>
                </UserHoverCard>
              </div>
            );
          })}

          <div ref={loaderRef} className="flex justify-center p-4">
            {isLoading ? (
              <Spinner />
            ) : error ? (
              <FetchError error={error} onRetry={retry} />
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}

export default LikedBy;
