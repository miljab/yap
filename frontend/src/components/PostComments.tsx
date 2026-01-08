import type { Post } from "@/types/post";
import CommentView from "./CommentView";

type PostCommentsProps = {
  post: Post;
};

function PostComments({ post }: PostCommentsProps) {
  console.log(post);

  if (post.comments.length === 0) return null;

  return (
    <div>
      {post.comments.map((comment) => {
        return <CommentView comment={comment} />;
      })}
    </div>
  );
}
export default PostComments;
