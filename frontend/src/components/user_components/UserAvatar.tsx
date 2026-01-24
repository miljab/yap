import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type UserAvatarProps = {
  avatarUrl: string;
  username: string;
};

function UserAvatar({ avatarUrl, username }: UserAvatarProps) {
  return (
    <Avatar>
      <AvatarImage src={avatarUrl} />
      <AvatarFallback>{username[0]}</AvatarFallback>
    </Avatar>
  );
}

export default UserAvatar;
