import { useCallback } from "react";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import type { Post } from "@/types/post";
import { Spinner } from "../ui/spinner";
import PostView from "../post_components/PostView";
import { useCachedInfiniteScroll } from "@/hooks/useCachedInfiniteScroll";
import FetchError from "../FetchError";

type ProfilePostsProps = {
  userId: string;
};

function ProfilePosts({ userId }: ProfilePostsProps) {
  const axiosPrivate = useAxiosPrivate();

  const fetchPosts = useCallback(
    async (currentCursor?: string) => {
      const url = currentCursor
        ? `/users/${userId}/posts?cursor=${currentCursor}`
        : `/users/${userId}/posts`;
      const response = await axiosPrivate.get(url);

      return {
        items: response.data.posts,
        nextCursor: response.data.nextCursor,
      };
    },
    [axiosPrivate, userId],
  );

  const {
    items: posts,
    setItems: setPosts,
    isLoading,
    initialLoad,
    loaderRef,
    error,
    retry,
  } = useCachedInfiniteScroll<Post>(fetchPosts, [userId], `profile:${userId}:posts`);

  const handlePostUpdate = (updatedPost: Post) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)),
    );
  };

  if (initialLoad) {
    return (
      <div className="flex justify-center p-4">
        <Spinner />
      </div>
    );
  }

  if (posts.length === 0) {
    return error ? (
      <FetchError error={error} onRetry={retry} />
    ) : (
      <div className="p-4 text-center text-neutral-500">No posts yet</div>
    );
  }

  return (
    <div>
      {posts.map((post) => (
        <PostView
          key={post.id}
          post={post}
          handlePostUpdate={handlePostUpdate}
          onCommentCreated={() => {
            setPosts((prev) =>
              prev.map((p) =>
                p.id === post.id
                  ? {
                      ...p,
                      commentCount: p.commentCount + 1,
                    }
                  : p,
              ),
            );
          }}
          onPostDelete={() => {
            setPosts((prev) => prev.filter((p) => p.id !== post.id));
          }}
        />
      ))}

      <div ref={loaderRef} className="flex justify-center p-4">
        {isLoading ? (
          <Spinner />
        ) : error ? (
          <FetchError error={error} onRetry={retry} />
        ) : null}
      </div>
    </div>
  );
}

export default ProfilePosts;
