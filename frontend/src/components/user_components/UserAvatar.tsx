import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Link } from "react-router";

type UserAvatarProps = {
  avatarUrl: string;
  username: string;
  className?: string;
  redirect?: boolean;
};

function UserAvatar({
  avatarUrl,
  username,
  className,
  redirect = true,
}: UserAvatarProps) {
  if (!redirect) {
    return (
      <Avatar className={className}>
        <AvatarImage src={avatarUrl} />
        <AvatarFallback>{username[0]}</AvatarFallback>
      </Avatar>
    );
  }

  return (
    <Avatar className={className}>
      <Link to={`/profile/${username}`}>
        <AvatarImage src={avatarUrl} />
      </Link>
      <Link to={`/profile/${username}`}>
        <AvatarFallback>{username[0]}</AvatarFallback>
      </Link>
    </Avatar>
  );
}

export default UserAvatar;
