import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useCallback } from "react";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import type { Post } from "@/types/post";
import { Spinner } from "../ui/spinner";
import PostView from "../post_components/PostView";
import FetchError from "../FetchError";

type SearchPostsProps = {
  query: string;
};

function SearchPosts({ query }: SearchPostsProps) {
  const axiosPrivate = useAxiosPrivate();

  const fetchPosts = useCallback(
    async (currentCursor?: string) => {
      if (!query?.trim()) {
        return { items: [], nextCursor: undefined };
      }

      const params = new URLSearchParams({ q: query });
      if (currentCursor) params.append("cursor", currentCursor);

      const url = `/search/posts?${params}`;
      const response = await axiosPrivate.get(url);

      return {
        items: response.data.posts,
        nextCursor: response.data.nextCursor,
      };
    },
    [query, axiosPrivate],
  );

  const { items, setItems, isLoading, initialLoad, loaderRef, error, retry } =
    useInfiniteScroll<Post>(fetchPosts, [query]);

  const handlePostUpdate = (updatedPost: Post) => {
    setItems((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)),
    );
  };

  if (query.length === 0) {
    return (
      <div className="p-4 text-center text-neutral-500">
        Type anything to search
      </div>
    );
  }

  if (initialLoad) {
    return (
      <div className="flex justify-center p-4">
        <Spinner />
      </div>
    );
  }

  if (items.length === 0) {
    return error ? (
      <FetchError error={error} onRetry={retry} />
    ) : (
      <div className="p-4 text-center text-neutral-500">No results found</div>
    );
  }

  return (
    <div>
      {items.map((post) => (
        <PostView
          key={post.id}
          post={post}
          handlePostUpdate={handlePostUpdate}
          onCommentCreated={() => {
            setItems((prev) =>
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
            setItems((prev) => prev.filter((p) => p.id !== post.id));
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

export default SearchPosts;
