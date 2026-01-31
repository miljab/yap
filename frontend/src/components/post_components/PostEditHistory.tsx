import type { PostHistory } from "@/types/post";
import { Dialog, DialogTrigger, DialogContent } from "../ui/dialog";

type PostHistoryProps = {
  history: PostHistory[];
};
function PostEditHistory({ history }: PostHistoryProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="w-fit cursor-pointer text-sm text-neutral-500 underline">
          Edited
        </button>
      </DialogTrigger>

      <DialogContent>
        {history.map((h) => {
          return (
            <div key={h.id} className="flex flex-col">
              <div>{new Date(h.createdAt).toLocaleDateString()}</div>
              <div>{h.content}</div>
            </div>
          );
        })}
      </DialogContent>
    </Dialog>
  );
}

export default PostEditHistory;
