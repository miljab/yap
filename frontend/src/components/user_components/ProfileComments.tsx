import { useEffect, useState } from "react";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import type { Comment } from "@/types/post";
import CommentView from "@/components/comment_components/CommentView";
import { Spinner } from "../ui/spinner";

type ProfileCommentsProps = {
  userId: string;
};

function ProfileComments({ userId }: ProfileCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        const response = await axiosPrivate.get(`/users/${userId}/comments`);
        setComments(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [axiosPrivate, userId]);

  const handleCommentCreated = (newComment: Comment) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === newComment.parentId
          ? { ...comment, commentCount: comment.commentCount + 1 }
          : comment,
      ),
    );
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-neutral-500">
        Loading...
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
        />
      ))}
    </div>
  );
}

export default ProfileComments;
