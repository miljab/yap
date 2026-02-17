import type { User } from "@/types/user";
import UserAvatar from "./UserAvatar";
import useAuthenticatedUser from "@/hooks/useAuthenticatedUser";
import EditProfile from "./EditProfile";
import FollowButton from "../FollowButton";

type ProfileHeaderProps = {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
};

function ProfileHeader({ user, onUserUpdate }: ProfileHeaderProps) {
  const authUser = useAuthenticatedUser();

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex items-end justify-between p-2">
        <UserAvatar
          avatarUrl={user.avatar}
          username={user.username}
          className="h-32 w-32"
        />
        {user.id === authUser.id ? (
          <EditProfile user={user} onProfileUpdate={onUserUpdate} />
        ) : (
          <FollowButton initialIsFollowed={user.isFollowed} userId={user.id} />
        )}
      </div>

      <span className="text-xl font-bold">{user.username}</span>

      {user.bio && <p>{user.bio}</p>}

      <div className="flex flex-col gap-1 text-sm text-neutral-500">
        <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
        <div className="flex gap-4">
          <button className="cursor-pointer hover:underline">
            {user.followingCount} Following
          </button>
          <button className="cursor-pointer hover:underline">
            {user.followersCount} Followers
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
