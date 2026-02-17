import { Button } from "./ui/button";

type FollowButtonProps = {
  isFollowed: boolean;
};

function FollowButton({ isFollowed }: FollowButtonProps) {
  return (
    <Button variant={isFollowed ? "outline" : "default"}>
      {isFollowed ? "Followed" : "Follow"}
    </Button>
  );
}

export default FollowButton;
