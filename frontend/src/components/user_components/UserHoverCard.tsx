import { useState, useRef, type ReactNode, useEffect } from "react";
import type { User } from "@/types/user";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import UserAvatar from "./UserAvatar";
import FollowButton from "../FollowButton";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import axios from "axios";

type UserHoverCardProps = {
  username: string;
  children: ReactNode;
};

function UserHoverCard({ username, children }: UserHoverCardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const axiosPrivate = useAxiosPrivate();
  const controllerRef = useRef<AbortController | null>(null);

  const fetchData = async () => {
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();

    try {
      const response = await axiosPrivate.get(`/profile/${username}`, {
        signal: controllerRef.current.signal,
      });

      setUser(response.data);
      setOpen(true);
    } catch (error) {
      if (axios.isCancel(error)) return;
      console.error(error);
    }
  };

  const onOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      controllerRef.current?.abort();
      setOpen(false);
      return;
    }

    if (user) {
      setOpen(true);
    } else {
      fetchData();
    }
  };

  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  return (
    <HoverCard open={open} onOpenChange={onOpenChange}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent>
        {user ? (
          <div>
            <div className="flex justify-between">
              <div className="flex flex-col">
                <UserAvatar
                  username={user.username}
                  avatarUrl={user.avatarUrl}
                />
                <span className="font-bold">{user.username}</span>
              </div>

              <div>
                <FollowButton
                  initialIsFollowed={user.isFollowed}
                  userId={user.id}
                />
              </div>
            </div>

            <div className="flex flex-col">
              <p>{user.bio}</p>
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
