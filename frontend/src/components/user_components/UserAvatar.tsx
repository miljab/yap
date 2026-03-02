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
    <Link to={`/profile/${username}`} className={className}>
      <Avatar className={className}>
        <AvatarImage src={avatarUrl} />
        <AvatarFallback>{username[0]}</AvatarFallback>
      </Avatar>
    </Link>
  );
}

export default UserAvatar;
