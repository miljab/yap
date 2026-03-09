import { useState, type ReactNode } from "react";
import type { User } from "@/types/user";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import UserAvatar from "./UserAvatar";
import FollowButton from "../FollowButton";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import useAuthenticatedUser from "@/hooks/useAuthenticatedUser";

const usersMap = new Map<string, User>();

type UserHoverCardProps = {
  username: string;
  children: ReactNode;
};

function UserHoverCard({ username, children }: UserHoverCardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const axiosPrivate = useAxiosPrivate();
  const authUser = useAuthenticatedUser();

  const fetchData = async () => {
    const cached = usersMap.get(username);

    if (cached) {
      setUser(cached);
      setOpen(true);
      return;
    }

    try {
      const response = await axiosPrivate.get(`/profile/${username}`);

      setUser(response.data);
      usersMap.set(username, response.data);
      setOpen(true);
    } catch (error) {
      console.error(error);
    }
  };

  const onOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setOpen(false);
      return;
    }

    fetchData();
  };

  const handleFollowChange = (isFollowed: boolean) => {
    if (!user) return;

    const updatedUser = { ...user, isFollowed: isFollowed };
    usersMap.set(username, updatedUser);
    setUser(updatedUser);
  };

  return (
    <HoverCard open={open} onOpenChange={onOpenChange}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent>
        {user ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <UserAvatar
                className="h-16 w-16"
                username={user.username}
                avatarUrl={user.avatarUrl}
              />

              {user.id !== authUser.id && (
                <FollowButton
                  userId={user.id}
                  onFollowChange={handleFollowChange}
                />
              )}
            </div>

            <div className="flex flex-col">
              <span className="truncate font-bold contain-inline-size">
                {user.username}
              </span>
              <p className="wrap-break-word">{user.bio}</p>
              <span className="text-sm text-neutral-500">
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </span>
              <div className="flex gap-2 text-sm text-neutral-500">
                <span>{user.followingCount} following</span>
                <span>{user.followersCount} followers</span>
              </div>
            </div>
          </div>
        ) : null}
      </HoverCardContent>
    </HoverCard>
  );
}

export default UserHoverCard;
