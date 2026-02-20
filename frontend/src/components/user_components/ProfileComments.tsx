import { useCallback } from "react";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import type { Comment } from "@/types/post";
import CommentView from "@/components/comment_components/CommentView";
import { Spinner } from "../ui/spinner";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

type ProfileCommentsProps = {
  userId: string;
};

function ProfileComments({ userId }: ProfileCommentsProps) {
  const axiosPrivate = useAxiosPrivate();

  const fetchComments = useCallback(
    async (currentCursor?: string) => {
      const url = currentCursor
        ? `/users/${userId}/comments?cursor=${currentCursor}`
        : `/users/${userId}/comments`;

      const response = await axiosPrivate.get(url);

      return {
        items: response.data.comments,
        nextCursor: response.data.nextCursor,
      };
    },
    [axiosPrivate, userId],
  );

  const {
    items: comments,
    setItems: setComments,
    isLoading,
    initialLoad,
    loaderRef,
  } = useInfiniteScroll<Comment>(fetchComments, [userId]);

  const handleCommentCreated = (newComment: Comment) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === newComment.parentId
          ? { ...comment, commentCount: comment.commentCount + 1 }
          : comment,
      ),
    );
  };

  if (initialLoad) {
    return (
      <div className="flex justify-center p-4">
        <Spinner />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="p-4 text-center text-neutral-500">No comments yet</div>
    );
  }

  return (
    <div>
      {comments.map((comment) => (
        <CommentView
          key={comment.id}
          comment={comment}
          onCommentCreated={handleCommentCreated}
          onCommentDelete={() => {
            setComments((prev) => prev.filter((c) => c.id !== comment.id));
          }}
        />
      ))}

      <div ref={loaderRef} className="flex justify-center p-4">
        {isLoading && <Spinner />}
      </div>
    </div>
  );
}

export default ProfileComments;
