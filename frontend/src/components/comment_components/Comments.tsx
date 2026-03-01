import CommentView from "./CommentView";
import type { Comment } from "@/types/post";

type CommentsProps = {
  comments: Comment[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  onCommentCreated: (newComment: Comment) => void;
  onCommentDeleted: () => void;
};

function Comments({
  comments,
  setComments,
  onCommentCreated,
  onCommentDeleted,
}: CommentsProps) {
  if (comments.length === 0) return null;

  return (
    <div>
      {comments.map((comment) => {
        return (
          <CommentView
            key={comment.id}
            comment={comment}
            onCommentCreated={onCommentCreated}
            onCommentDelete={() => {
              setComments((prev) => prev.filter((c) => c.id !== comment.id));
              onCommentDeleted();
            }}
          />
        );
      })}
    </div>
  );
}
export default Comments;
