import UserAvatar from "../user_components/UserAvatar";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Link } from "react-router";
import { useCallback, useState } from "react";
import { axiosPrivate } from "@/api/axios";
import type { PostHistory } from "@/types/post";
import { Spinner } from "../ui/spinner";
import FetchError from "../FetchError";
import { type FetchErrorState, getErrorState } from "@/lib/fetchError";
import UserHoverCard from "../user_components/UserHoverCard";

type PostHistoryProps = {
  postId: string;
  user: {
    avatarUrl: string;
    username: string;
  };
};
function PostEditHistory({ postId, user }: PostHistoryProps) {
  const [history, setHistory] = useState<PostHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FetchErrorState | null>(null);
  const [open, setOpen] = useState(false);

  const fetchEditHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axiosPrivate.get(`/post/${postId}/history`);

      setHistory(response.data);
    } catch (err) {
      setError(getErrorState(err));
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && history.length === 0) fetchEditHistory();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="w-fit cursor-pointer text-sm text-neutral-500 underline">
          Edited
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Post edition history</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Spinner />
          </div>
        ) : error ? (
          <FetchError error={error} onRetry={fetchEditHistory} />
        ) : (
          <div className="flex max-h-[500px] flex-col gap-1 overflow-auto">
            {history.map((h, idx) => {
              return (
                <div
                  key={h.id}
                  className={`flex w-full cursor-pointer gap-2 p-2 ${idx !== history.length - 1 && "border-b-1"}`}
                >
                  <UserHoverCard username={user.username}>
                    <span>
                      <UserAvatar
                        avatarUrl={user.avatarUrl}
                        username={user.username}
                      />
                    </span>
                  </UserHoverCard>

                  <div className="flex grow flex-col justify-start gap-1">
                    <div className="flex gap-1 text-sm">
                      <UserHoverCard username={user.username}>
                        <Link
                          to={`/profile/${user.username}`}
                          className="flex cursor-pointer items-center font-bold hover:underline"
                        >
                          {user.username}
                        </Link>
                      </UserHoverCard>
                      <span className="text-neutral-500">&middot;</span>
                      <span className="text-neutral-500">
                        {new Date(h.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {h.content?.trim() ? (
                      <p className="wrap-break-word contain-inline-size">
                        {h.content}
                      </p>
                    ) : (
                      <span className="text-neutral-500 italic">
                        (No caption)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default PostEditHistory;
