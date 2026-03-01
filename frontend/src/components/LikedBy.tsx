import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import UserAvatar from "./user_components/UserAvatar";
import { Link } from "react-router";
import { useCallback } from "react";
import type { User } from "@/types/user";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { Spinner } from "./ui/spinner";

type LikedByProps = {
  likeCount: number;
  type: "post" | "comment";
  id: string;
};

function LikedBy({ likeCount, type, id }: LikedByProps) {
  const axiosPrivate = useAxiosPrivate();

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
    [axiosPrivate, id, type],
  );

  const { items, isLoading, initialLoad, loaderRef } =
    useInfiniteScroll<User>(fetchLikers);

  if (initialLoad) {
    return (
      <div className="flex justify-center p-4">
        <Spinner />
      </div>
    );
  }

  if (items.length === 0) {
    return <div className="p-4 text-center text-neutral-500">No likes yet</div>;
  }

  return (
    <Dialog>
      {" "}
      <DialogTrigger asChild>
        <button className="cursor-pointer hover:underline">{likeCount}</button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Liked by</DialogTitle>
        </DialogHeader>

        <div className="flex max-h-[500px] flex-col gap-2 overflow-auto">
          {items.map((user, idx) => {
            return (
              <div
                className={`flex items-center gap-2 p-1 ${idx !== items.length - 1 && "border-b-1"}`}
              >
                <UserAvatar
                  avatarUrl={user.avatarUrl}
                  username={user.username}
                />
                <Link
                  to={`/profile/${user.username}`}
                  className="cursor-pointer hover:underline"
                >
                  {user.username}
                </Link>
              </div>
            );
          })}

          <div ref={loaderRef} className="flex justify-center p-4">
            {isLoading && <Spinner />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default LikedBy;
