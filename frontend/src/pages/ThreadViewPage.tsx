import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import PostView from "../components/post_components/PostView";
import type { Post, Comment } from "@/types/post";
import type { NavigationState } from "@/types/navigation";
import CommentView from "../components/comment_components/CommentView";
import CreateComment from "../components/comment_components/CreateComment";
import BackButton from "@/components/BackButton";

function ThreadViewPage() {
  const params = useParams();
  const axiosPrivate = useAxiosPrivate();
  const [post, setPost] = useState<Post | null>(null);
  const [comment, setComment] = useState<Comment | null>(null);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [parentComments, setParentComments] = useState<Comment[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
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

  const onParentCommentDelete = (com: Comment) => {
    const { historyStack, origin } = location.state as NavigationState;

    if (
      historyStack &&
      Array.isArray(historyStack) &&
      historyStack.length > 0
    ) {
      const pathnameToDelete = `/comment/${com.id}`;
      const index = historyStack.indexOf(pathnameToDelete);

      if (index !== -1) {
        const newStack = historyStack.slice(0, index);

        const url = newStack.pop();

        if (url) {
          navigate(url, {
            state: {
              origin: origin,
              historyStack: newStack,
            },
          });
          return;
        }
      }
    }

    navigate(post ? `/post/${post.id}` : location.state?.origin || "/home", {
      state: {
        historyStack: historyStack || [],
        origin: origin,
      },
    });
  };

  if (!post || !comment) return null;

  return (
    <div>
      <BackButton />
      <PostView
        post={post}
        handlePostUpdate={handlePostUpdate}
        onCommentCreated={onPostCommentCreated}
        onPostDelete={() => {
          navigate((location.state as NavigationState)?.origin || "/home");
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
              onParentCommentDelete(com);
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
            const { historyStack, origin } = location.state as NavigationState;

            if (
              historyStack &&
              Array.isArray(historyStack) &&
              historyStack.length > 0
            ) {
              const newStack = [...historyStack];
              const url = newStack.pop();

              if (url) {
                navigate(url, {
                  state: {
                    historyStack: newStack,
                    origin: origin,
                  },
                });

                return;
              }
            }
            navigate(`/post/${post.id}`, {
              state: {
                historyStack: historyStack || [],
                origin: origin,
              },
            });
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
