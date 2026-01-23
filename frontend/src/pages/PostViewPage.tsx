import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import type { Comment, Post } from "@/types/post";
import PostView from "../components/post_components/PostView";
import CreateComment from "@/components/comment_components/CreateComment";
import Comments from "@/components/comment_components/Comments";

function PostViewPage() {
  const params = useParams();
  const axiosPrivate = useAxiosPrivate();
  const [post, setPost] = useState<Post | null>(null);
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axiosPrivate.get(`/post/${params.id}`);

        setPost(response.data);
      } catch (error) {
        console.error(error);

        navigate("/error", {
          state: { error: "Failed to fetch post. Please try again." },
        });
      }
    };

    fetchPost();
  }, [params.id, axiosPrivate, navigate]);

  if (!post) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <PostView post={post} />
      <CreateComment postId={post.id} setComments={setComments} />
      <Comments
        postId={post.id}
        comments={comments}
        setComments={setComments}
      />
    </div>
  );
}

export default PostViewPage;
