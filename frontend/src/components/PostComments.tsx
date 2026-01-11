import CommentView from "./CommentView";
import { useEffect, useState } from "react";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import type { Comment } from "@/types/post";

type PostCommentsProps = {
  postId: string;
};

function PostComments({ postId }: PostCommentsProps) {
  const axiosPrivate = useAxiosPrivate();
  const [comments, setComments] = useState<Comment[]>([]);

  console.log(postId);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axiosPrivate.get(`/post/${postId}/comments`);

        setComments(response.data);
        console.log(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchComments();
  }, [postId, axiosPrivate]);

  if (comments.length === 0) return null;

  return (
    <div>
      {comments.map((comment) => {
        return <CommentView key={comment.id} comment={comment} />;
      })}
    </div>
  );
}
export default PostComments;
