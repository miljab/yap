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

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)),
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
        <PostView
          post={post}
          handlePostUpdate={handlePostUpdate}
          onCommentCreated={(newComment: Comment) => {
            setPosts((prev) =>
              prev.map((p) =>
                p.id === post.id
                  ? {
                      ...p,
                      comments: [newComment, ...p.comments],
                      commentCount: p.commentCount + 1,
                    }
                  : p,
              ),
            );
          }}
        />
      ))}
    </div>
  );
}

export default ProfilePosts;
