import { useCallback, useEffect, useState, useRef } from "react";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import type { Comment } from "@/types/post";
import CommentView from "@/components/comment_components/CommentView";
import { Spinner } from "../ui/spinner";

type ProfileCommentsProps = {
  userId: string;
};

function ProfileComments({ userId }: ProfileCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const axiosPrivate = useAxiosPrivate();

  const handleCommentCreated = (newComment: Comment) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === newComment.parentId
          ? { ...comment, commentCount: comment.commentCount + 1 }
          : comment,
      ),
    );
  };

  const fetchComments = useCallback(
    async (currentCursor?: string) => {
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;

      try {
        setIsLoading(true);
        const url = currentCursor
          ? `/users/${userId}/comments?cursor=${currentCursor}`
          : `/users/${userId}/comments`;

        const response = await axiosPrivate.get(url);

        setComments((prev) =>
          currentCursor
            ? [...prev, ...response.data.comments]
            : response.data.comments,
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
    [axiosPrivate, userId],
  );

  useEffect(() => {
    setComments([]);
    setCursor(null);
    setHasMore(true);
    setInitialLoad(true);
    fetchComments();
  }, [userId, fetchComments]);

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
          fetchComments(cursor ?? undefined);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(loader);

    return () => observer.disconnect();
  }, [cursor, hasMore, isLoading, initialLoad, fetchComments]);

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
        />
      ))}

      <div ref={loaderRef} className="flex justify-center p-4">
        {isLoading && <Spinner />}
      </div>
    </div>
  );
}

export default ProfileComments;
