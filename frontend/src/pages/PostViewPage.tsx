import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import type { Comment, Post } from "@/types/post";
import PostView from "../components/post_components/PostView";
import CreateComment from "@/components/comment_components/CreateComment";
import Comments from "@/components/comment_components/Comments";
import BackButton from "@/components/BackButton";

function PostViewPage() {
  const params = useParams();
  const axiosPrivate = useAxiosPrivate();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const isDeleting = useRef(false);

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

  useEffect(() => {
    const fetchData = async () => {
      if (isDeleting.current) return;

      try {
        const [postRes, commentsRes] = await Promise.all([
          axiosPrivate.get(`/post/${params.id}`),
          axiosPrivate.get(`/post/${params.id}/comments`),
        ]);

        setPost(postRes.data);
        setComments(commentsRes.data);
      } catch (error) {
        console.error(error);

        navigate("/error", {
          state: { error: "Failed to fetch post. Please try again." },
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id, axiosPrivate, navigate]);

  if (isLoading || !post) {
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
          navigate(location.state?.from || "/home");
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
