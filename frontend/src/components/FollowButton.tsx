import { Button } from "./ui/button";
import { useState } from "react";
import { toast } from "sonner";
import useFollow from "@/hooks/useFollow";

type FollowButtonProps = {
  userId: string;
  onFollowChange?: (isFollowed: boolean) => void;
};

function FollowButton({
  userId,
  onFollowChange,
}: FollowButtonProps) {
  const { isFollowing, toggleFollow } = useFollow();
  const [isSubmiting, setIsSubmiting] = useState(false);
  const isFollowed = isFollowing(userId);

  const handleFollow = async () => {
    setIsSubmiting(true);

    try {
      await toggleFollow(userId);
      const newState = !isFollowing(userId);
      if (onFollowChange) onFollowChange(newState);
    } catch (error) {
      console.error(error);
      toast.error("Failed to change follow status.");
    } finally {
      setIsSubmiting(false);
    }
  };

  return (
    <Button
      disabled={isSubmiting}
      onClick={handleFollow}
      variant={isFollowed ? "outline" : "default"}
      className="w-24"
    >
      {isFollowed ? "Followed" : "Follow"}
    </Button>
  );
}

export default FollowButton;
