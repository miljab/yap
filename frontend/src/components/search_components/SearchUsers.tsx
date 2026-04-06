import { axiosPrivate } from "@/api/axios";
import { useCachedInfiniteScroll } from "@/hooks/useCachedInfiniteScroll";
import { useCallback } from "react";
import type { User } from "@/types/user";
import { Spinner } from "../ui/spinner";
import FetchError from "../FetchError";
import UserHoverCard from "../user_components/UserHoverCard";
import { Link } from "react-router";
import UserAvatar from "../user_components/UserAvatar";

type SearchUsersProps = {
  query: string;
};

function SearchUsers({ query }: SearchUsersProps) {
  const fetchUsers = useCallback(
    async (currentCursor?: string) => {
      if (!query?.trim()) {
        return { items: [], nextCursor: undefined };
      }

      const params = new URLSearchParams({ q: query });
      if (currentCursor) params.append("cursor", currentCursor);

      const url = `/search/users?${params}`;
      const response = await axiosPrivate.get(url);

      return {
        items: response.data.users,
        nextCursor: response.data.nextCursor,
      };
    },
    [query],
  );

  const { items, isLoading, initialLoad, loaderRef, error, retry } =
    useCachedInfiniteScroll<User>(fetchUsers, [query], `search:users:${query}`);

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
      {items.map((user) => {
        return (
          <Link
            to={`/profile/${user.username}`}
            key={user.id}
            className="hover:bg-accent flex cursor-pointer items-center gap-1 border-b p-2 dark:border-neutral-800 dark:hover:bg-[#1f1f1f]"
          >
            <UserHoverCard username={user.username}>
              <span>
                <UserAvatar
                  avatarUrl={user.avatarUrl}
                  username={user.username}
                  redirect={false}
                />
              </span>
            </UserHoverCard>

            <div className="flex grow flex-col">
              <UserHoverCard username={user.username}>
                <div className="w-fit">
                  <span className="cursor-pointer wrap-break-word contain-inline-size hover:underline">
                    {user.username}
                  </span>
                </div>
              </UserHoverCard>
              <p className="truncate wrap-break-word text-neutral-500 contain-inline-size">
                {user.bio}
              </p>
            </div>
          </Link>
        );
      })}
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

export default SearchUsers;
