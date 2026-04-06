import { axiosPrivate } from "@/api/axios";
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import type { Comment, Post } from "@/types/post";
import type { NavigationState } from "@/types/navigation";
import PostView from "../components/post_components/PostView";
import CreateComment from "@/components/comment_components/CreateComment";
import Comments from "../components/comment_components/Comments";
import BackButton from "@/components/BackButton";
import FetchError from "@/components/FetchError";
import { type FetchErrorState, getErrorState } from "@/lib/fetchError";
import { Spinner } from "@/components/ui/spinner";

function PostViewPage() {
  const params = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FetchErrorState | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isDeleting = useRef(false);

  const fetchData = useCallback(async () => {
    if (isDeleting.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const [postRes, commentsRes] = await Promise.all([
        axiosPrivate.get(`/post/${params.id}`),
        axiosPrivate.get(`/post/${params.id}/comments`),
      ]);

      setPost(postRes.data);
      setComments(commentsRes.data);
    } catch (err) {
      const errorState = getErrorState(err);

      if (errorState.type === "not_found") {
        navigate("/error", {
          state: { error: "Post not found." },
        });
        return;
      }

      setError(errorState);
    } finally {
      setIsLoading(false);
    }
  }, [params.id, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onCommentCreated = (newComment: Comment) => {
    if (newComment.postId === post?.id && !newComment.parentId) {
      setComments((prev) => [newComment, ...prev]);
      setPost((prevPost) => {
        if (!prevPost) return null;
        return { ...prevPost, commentCount: prevPost.commentCount + 1 };
      });
    } else {
      setComments((prevComments) =>
        prevComments.map((c) =>
          c.id === newComment.parentId
            ? { ...c, commentCount: c.commentCount + 1 }
            : c,
        ),
      );
    }
  };

  const handlePostUpdate = (updatedPost: Post) => {
    setPost(updatedPost);
  };

  const onCommentDeleted = () => {
    setPost((prev) => {
      if (!prev) return null;
      return { ...prev, commentCount: prev.commentCount - 1 };
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full">
        <BackButton />
        <div className="flex min-h-[50vh] flex-col items-center justify-center">
          <Spinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full">
        <BackButton />
        <div className="flex min-h-[50vh] flex-col items-center justify-center">
          <FetchError error={error} onRetry={fetchData} />
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="flex flex-col">
      <BackButton />
      <PostView
        post={post}
        handlePostUpdate={handlePostUpdate}
        onCommentCreated={onCommentCreated}
        onPostDelete={() => {
          isDeleting.current = true;
          navigate((location.state as NavigationState)?.origin || "/home");
        }}
      />
      <div className="border-b">
        <CreateComment postId={post.id} onCommentCreated={onCommentCreated} />
      </div>
      <Comments
        comments={comments}
        setComments={setComments}
        onCommentCreated={onCommentCreated}
        onCommentDeleted={onCommentDeleted}
      />
    </div>
  );
}

export default PostViewPage;
