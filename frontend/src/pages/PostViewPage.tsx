import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import type { Post } from "@/types/post";
import PostView from "@/components/PostView";

function PostViewPage() {
  const params = useParams();
  const axiosPrivate = useAxiosPrivate();
  const [post, setPost] = useState<Post | null>(null);
  const navigate = useNavigate();

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
    <div>
      <PostView post={post} />
    </div>
  );
}

export default PostViewPage;
