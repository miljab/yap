import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type UserAvatarProps = {
  avatarUrl: string;
  username: string;
  className?: string;
};

function UserAvatar({ avatarUrl, username, className }: UserAvatarProps) {
  return (
    <Avatar className={className}>
      <AvatarImage src={avatarUrl} />
      <AvatarFallback>{username[0]}</AvatarFallback>
    </Avatar>
  );
}

export default UserAvatar;
