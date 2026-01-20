import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import PostView from "./PostView";
import type { Post, Comment } from "@/types/post";
import CommentView from "./CommentView";
import CreateComment from "./CreateComment";

function ThreadView() {
  const params = useParams();
  const axiosPrivate = useAxiosPrivate();
  const [post, setPost] = useState<Post | null>(null);
  const [comment, setComment] = useState<Comment | null>(null);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [parentComments, setParentComments] = useState<Comment[]>([]);

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

  if (!post || !comment) return null;

  return (
    <div>
      <PostView post={post} />

      {parentComments.map((com) => {
        return <CommentView key={com.id} comment={com} isParent={true} />;
      })}

      <div>
        <CommentView isSelected={true} comment={comment} />
      </div>

      <div>
        <CreateComment
          postId={post.id}
          parentId={comment.id}
          setComments={setReplies}
        />
      </div>

      <div>
        {replies.map((reply) => {
          return <CommentView key={reply.id} comment={reply} />;
        })}
      </div>
    </div>
  );
}

export default ThreadView;
