import { useCallback } from "react";
import type { Post } from "@/types/post";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import PostView from "./PostView";
import { Spinner } from "../ui/spinner";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import CreatePost from "./CreatePost";

type HomeFeedProps = {
  type: "all" | "following";
};

function HomeFeed({ type }: HomeFeedProps) {
  const axiosPrivate = useAxiosPrivate();

  const fetchPosts = useCallback(
    async (currentCursor?: string) => {
      let url;

      if (type === "all") {
        url = currentCursor ? `/feed?cursor=${currentCursor}` : "/feed";
      } else {
        url = currentCursor
          ? `/feed/following?cursor=${currentCursor}`
          : "/feed/following";
      }
      const response = await axiosPrivate.get(url);

      return {
        items: response.data.posts,
        nextCursor: response.data.nextCursor,
      };
    },
    [axiosPrivate, type],
  );

  const {
    items: posts,
    setItems: setPosts,
    isLoading,
    initialLoad,
    loaderRef,
  } = useInfiniteScroll<Post>(fetchPosts, []);

  const handlePostCreate = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  };

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
    return (
      <div className="p-4 text-center text-neutral-500">
        No posts to display
      </div>
    );
  }

  return (
    <div>
      <CreatePost
        onPostCreate={type === "all" ? handlePostCreate : undefined}
      />
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
        {isLoading && <Spinner />}
      </div>
    </div>
  );
}

export default HomeFeed;
