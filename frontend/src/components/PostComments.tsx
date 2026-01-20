import CommentView from "./CommentView";
import { useEffect, type SetStateAction } from "react";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import type { Comment } from "@/types/post";

type PostCommentsProps = {
  postId: string;
  comments: Comment[];
  setComments: React.Dispatch<SetStateAction<Comment[]>>;
};

function PostComments({ postId, comments, setComments }: PostCommentsProps) {
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axiosPrivate.get(`/post/${postId}/comments`);

        setComments(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchComments();
  }, [postId, axiosPrivate, setComments]);

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
