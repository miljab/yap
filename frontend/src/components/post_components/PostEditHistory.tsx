import UserAvatar from "../user_components/UserAvatar";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import type { PostHistory } from "@/types/post";
import { toast } from "sonner";

type PostHistoryProps = {
  postId: string;
  user: {
    avatarUrl: string;
    username: string;
  };
};
function PostEditHistory({ postId, user }: PostHistoryProps) {
  const [history, setHistory] = useState<PostHistory[]>([]);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const fetchEditHistory = async () => {
      try {
        const response = await axiosPrivate.get(`/post/${postId}/history`);

        setHistory(response.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch edit history. Please try again.");
      }
    };

    fetchEditHistory();
  }, [postId, axiosPrivate]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="w-fit cursor-pointer text-sm text-neutral-500 underline">
          Edited
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Post edition history</DialogTitle>
        </DialogHeader>
        <div className="flex max-h-[500px] flex-col gap-1 overflow-auto">
          {history.map((h, idx) => {
            return (
              <div
                key={h.id}
                className={`flex w-full cursor-pointer gap-2 p-2 ${idx !== history.length - 1 && "border-b-1"}`}
              >
                <div className="flex flex-col items-center">
                  <UserAvatar
                    avatarUrl={user.avatarUrl}
                    username={user.username}
                  />
                </div>

                <div className="flex grow flex-col justify-start gap-1">
                  <div className="flex gap-1 text-sm">
                    <Link
                      to={`/profile/${user.username}`}
                      className="flex cursor-pointer items-center font-bold hover:underline"
                    >
                      {user.username}
                    </Link>
                    <span className="text-neutral-500">&middot;</span>
                    <span className="text-neutral-500">
                      {new Date(h.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {h.content ? (
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
      </DialogContent>
    </Dialog>
  );
}

export default PostEditHistory;
