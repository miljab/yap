import { type Post } from "../types/post";

type PostViewProps = {
  post: Post;
};

function PostView({ post }: PostViewProps) {
  return (
    <div>
      <p>{post.content}</p>
      <div>
        {post.images.map((image) => (
          <img key={image.id} src={image.url} alt="" />
        ))}
      </div>
    </div>
  );
}

export default PostView;
