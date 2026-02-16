import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import PostView from "../components/post_components/PostView";
import type { Post, Comment } from "@/types/post";
import CommentView from "../components/comment_components/CommentView";
import CreateComment from "../components/comment_components/CreateComment";

function ThreadViewPage() {
  const params = useParams();
  const axiosPrivate = useAxiosPrivate();
  const [post, setPost] = useState<Post | null>(null);
  const [comment, setComment] = useState<Comment | null>(null);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [parentComments, setParentComments] = useState<Comment[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const isDeleting = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      if (isDeleting.current) return;

      try {
        const response = await axiosPrivate.get(`/comment/${params.id}/thread`);

        setPost(response.data.post);
        setComment(response.data.comment);
        setReplies(response.data.replies);
        setParentComments(response.data.parentComments);
      } catch (error) {
        console.error(error);
        // TODO error handling
      }
    };

    fetchData();
  }, [params, axiosPrivate]);

  const handlePostUpdate = (updatedPost: Post) => {
    setPost(updatedPost);
  };

  const onPostCommentCreated = () => {
    setPost((prevPost) => {
      if (!prevPost) return null;
      return { ...prevPost, commentCount: prevPost.commentCount + 1 };
    });
  };

  const onSelectedCommentCreated = (newComment: Comment) => {
    setReplies((prevReplies) => [newComment, ...prevReplies]);
    setComment((prevComment) => {
      if (!prevComment) return null;
      return { ...prevComment, commentCount: prevComment.commentCount + 1 };
    });
  };

  const onParentCommentCreated = (newComment: Comment) => {
    setParentComments((prevComments) =>
      prevComments.map((c) =>
        c.id === newComment.parentId
          ? { ...c, commentCount: c.commentCount + 1 }
          : c,
      ),
    );
  };

  const onReplyCommentCreated = (newComment: Comment) => {
    setReplies((prevComments) =>
      prevComments.map((c) =>
        c.id === newComment.parentId
          ? { ...c, commentCount: c.commentCount + 1 }
          : c,
      ),
    );
  };

  if (!post || !comment) return null;

  return (
    <div>
      <PostView
        post={post}
        handlePostUpdate={handlePostUpdate}
        onCommentCreated={onPostCommentCreated}
        onPostDelete={() => {
          isDeleting.current = true;
          navigate(location.state?.from || "/home");
        }}
      />

      {parentComments.map((com) => {
        return (
          <CommentView
            key={com.id}
            comment={com}
            isParent={true}
            onCommentCreated={onParentCommentCreated}
            onCommentDelete={() => {
              if (com.parentId) {
                navigate(`/comment/${com.parentId}/`, {
                  state: location.state,
                });
              } else {
                isDeleting.current = true;
                navigate(`/post/${post.id}`, { state: location.state });
              }
            }}
          />
        );
      })}

      <div>
        <CommentView
          isSelected={true}
          comment={comment}
          onCommentCreated={onSelectedCommentCreated}
          onCommentDelete={() => {
            if (comment.parentId) {
              navigate(`/comment/${comment.parentId}/`, {
                state: location.state,
              });
            } else {
              isDeleting.current = true;
              navigate(`/post/${post.id}`, { state: location.state });
            }
          }}
        />
      </div>

      <div className="border-t border-b">
        <CreateComment
          postId={post.id}
          parentId={comment.id}
          onCommentCreated={onSelectedCommentCreated}
        />
      </div>

      <div>
        {replies.map((reply) => {
          return (
            <CommentView
              key={reply.id}
              comment={reply}
              onCommentCreated={onReplyCommentCreated}
              onCommentDelete={() => {
                setReplies((prev) => prev.filter((r) => r.id !== reply.id));
                setComment((prev) => {
                  if (!prev) return null;
                  return { ...prev, commentCount: prev.commentCount - 1 };
                });
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default ThreadViewPage;
