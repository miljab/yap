import { useEffect, useState, useRef, useCallback } from "react";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import type { Post, Comment } from "@/types/post";
import { Spinner } from "../ui/spinner";
import PostView from "../post_components/PostView";

type ProfilePostsProps = {
  userId: string;
};

function ProfilePosts({ userId }: ProfilePostsProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const axiosPrivate = useAxiosPrivate();

  const fetchPosts = useCallback(
    async (currentCursor?: string) => {
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;

      try {
        setIsLoading(true);
        const url = currentCursor
          ? `/users/${userId}/posts?cursor=${currentCursor}`
          : `/users/${userId}/posts`;
        const response = await axiosPrivate.get(url);

        setPosts((prev) =>
          currentCursor
            ? [...prev, ...response.data.posts]
            : response.data.posts,
        );
        setCursor(response.data.nextCursor);
        setHasMore(response.data.nextCursor !== null);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
        setInitialLoad(false);
        isLoadingRef.current = false;
      }
    },
    [axiosPrivate, userId],
  );

  useEffect(() => {
    setPosts([]);
    setCursor(null);
    setHasMore(true);
    setInitialLoad(true);
    fetchPosts();
  }, [userId, fetchPosts]);

  useEffect(() => {
    const loader = loaderRef.current;
    if (!loader) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isLoading &&
          !initialLoad
        ) {
          fetchPosts(cursor ?? undefined);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(loader);

    return () => observer.disconnect();
  }, [cursor, hasMore, isLoading, initialLoad, fetchPosts]);

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
    return <div className="p-4 text-center text-neutral-500">No posts yet</div>;
  }

  return (
    <div>
      {posts.map((post) => (
        <PostView
          key={post.id}
          post={post}
          handlePostUpdate={handlePostUpdate}
          onCommentCreated={(newComment: Comment) => {
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
        />
      ))}

      <div ref={loaderRef} className="flex justify-center p-4">
        {isLoading && <Spinner />}
      </div>
    </div>
  );
}

export default ProfilePosts;
