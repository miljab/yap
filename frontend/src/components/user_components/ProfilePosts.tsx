import { useEffect, useState } from "react";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import type { Post, Comment } from "@/types/post";
import { Spinner } from "../ui/spinner";
import PostView from "../post_components/PostView";

type ProfilePostsProps = {
  userId: string;
};

function ProfilePosts({ userId }: ProfilePostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await axiosPrivate.get(`/users/${userId}/posts`);
        setPosts(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [axiosPrivate, userId]);

  const handleCommentCreated = (newComment: Comment, postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              commentCount: post.commentCount + 1,
              comments: [newComment, ...post.comments],
            }
          : post,
      ),
    );
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-neutral-500">
        Loading...
        <Spinner />
      </div>
    );
  }

  if (posts.length === 0) {
    return <div className="p-4 text-center text-neutral-500">No posts yet</div>;
  }

  return (
    <div>
      {posts.map((post) => (
        // placeholder, needs PostView refactor
        <div>{post.content}</div>
      ))}
    </div>
  );
}

export default ProfilePosts;
